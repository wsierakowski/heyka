// TODO rewrite using async await:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');//
const async = require('async');
const YAML = require('yamljs');
const marked = require('marked');
const os = require('os');//
const moment = require('moment');//

const myUtils = require('../libs/my-utils');
const myFsUtils = require('../libs/my-fs-utils');
const conf = require('../config');

const model = require('../model');
const blog = model.blogDB;

const validateArticleConf = require('./article-conf-validator');

const FILES = {
  CONF: 'conf',
  BRIEF: 'brief',
  EXTENDED: 'extended'
};

const EXTS = {
  CONF: {JSON: 'json', YAML: 'yaml'},
  BRIEF: {HTML: 'html', MD: 'md'},
  EXTENDED: {HTML: 'html', MD: 'md'}
};

class ArticleImporter {
  constructor() {}

  initialImport(cb) {
    initialImport(cb);
  }

  // TODO: instead of doing full reimport, make it smart and partial
  repoUpdatedImport(cb) {
    repoUpdatedImport(cb);
  }
}

function initialImport(cb) {

  myFsUtils.makeDirSync(conf.app.paths.tempDir);

  // TODO - can both makeDirSyncs be one?
  myFsUtils.makeDirSync(conf.app.paths.staticFilesDir);

  // 1. Locate all directories with conf files
  const globPath =
    path.join(conf.app.paths.localRepoDir, '**', FILES.CONF) + `.{${EXTS.CONF.JSON},${EXTS.CONF.YAML}}`;

  glob(globPath, (globErr, articleConfPaths) => {

    if (globErr) throw `Error getting configuration files for articles: ${globErr}.`;

    // here we have a list of all dirs with conf files!
    console.log(`articleConfPaths: ${articleConfPaths}`);
    console.log('==============================')
    // 2. Load articles - each is represented by a configuration file
    async.eachSeries(
      articleConfPaths,
      loadArticle(/*db, conf.app.paths.staticFilesDir*/),
      (loadArticlesErr, res) => {
        if (loadArticlesErr) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('*** A file failed to process:', loadArticlesErr);
          return cb(loadArticlesErr)
        }
        console.log('All files have been processed successfully.');
        // TODO remove old static file folders if any
        // TODO replace the model if refreshing local repo after pull...
        glob(conf.app.paths.staticFilesPrefix + '*', (oldStaticGlobErr, oldStaticPaths) => {
          oldStaticPaths = oldStaticPaths.filter(staticPath => staticPath !== conf.app.paths.staticFilesDir);

          // async.everySeries doesn't work for some weird reason
          async.every(oldStaticPaths, (filePath, removeCb) => {
              fs.remove(filePath, function(removeErr) {
                if (removeErr) removeCb(removeErr);
                removeCb(null);
              });
            }, (removeSeriesErr, result) => {
              if (removeSeriesErr) return cb(removeSeriesErr);
              cb(null);
            }
          );
        });
      }
    );
  });
}

function repoUpdatedImport(cb) {
  cb('Not implemented');
}

function loadArticle(/*db, staticFilesDirPath*/) {
  return function (articleConfPath, loadArticleCb) {

    const confExt = path.extname(articleConfPath).toLowerCase();
    const articlePath = path.dirname(articleConfPath);

    async.waterfall([

      // 1. Read article conf file
      function readConfFile(cb) {
        fs.readFile(articleConfPath, 'utf-8', cb);
      },

      // 2. Parse article conf file into obj
      function parseConfFile(content, cb) {
        let parsedArticleConf;
        try {
          parsedArticleConf = confExt === '.json' ?
            JSON.parse(content) : YAML.parse(content);
        } catch(parseError) {
          return cb({where: 'parseConfFile' ,path: articleConfPath, error: parseError});
        }
        // to avoid "RangeError: Maximum call stack size exceeded."
        async.setImmediate(function() {
          cb(null, parsedArticleConf);
        });
      },

      // 3. Validate article conf file
      function validateArticleConfig(articleConf, cb) {
        let res = validateArticleConf(articleConf);
        if (res.length > 0) {
          return cb({where: 'validateArticleConfig', path: articleConfPath, error: res.join('.\n')});
        }
        // to avoid "RangeError: Maximum call stack size exceeded."
        async.setImmediate(function() {
          cb(null, articleConf);
        });
      },

      // 4. Read brief and extended content
      function readBriefAndExtended(articleConf, cb) {
        const briefExt = path.extname(articleConf.content.brief).toLowerCase();
        const extendedExt = path.extname(articleConf.content.extended).toLowerCase();
        async.map([
            path.join(articlePath, articleConf.content.brief),
            path.join(articlePath, articleConf.content.extended)
          ],
          fs.readFile,
          (err, res) => {
            if (err) return cb({where: 'readBriefAndExtended', path: articleConfPath, error: err});

            let briefBody = res[0].toString();
            if (briefExt === '.' + EXTS.BRIEF.HTML) articleConf.content.briefBody = briefBody;
            else if (briefExt === '.' + EXTS.BRIEF.MD) articleConf.content.briefBody = marked(briefBody);
            else return cb({
              where: 'readBriefAndExtended',
              path: articleConfPath,
              error: `Unsupported brief file type ${articleConf.content.brief}`}
            );

            let extendedBody = res[1].toString();
            if (extendedBody) articleConf.content.isExtended = true;
            if (extendedExt === '.' + EXTS.EXTENDED.HTML) articleConf.content.extendedBody = extendedBody;
            else if (extendedExt === '.' + EXTS.EXTENDED.MD) articleConf.content.extendedBody = marked(extendedBody);
            else return cb({
              where: 'readBriefAndExtended',
              path: articleConfPath,
              error: `Unsupported extended file type ${articleConf.content.extended}`}
            );

            cb(null, articleConf);
          }
        );
      },

      // 5. Do all necessary processing on the articleConf before it is passed to db
      function processConf(articleConf, cb) {
        articleConf._id = articleConf.id = articleConf.slug = myUtils.slugify(articleConf.title);
        // TODO rething whether we still need to keep almost entire category doc in article
        // after we changed the way how we query articles by category...
        articleConf.category = {
          _id: myUtils.slugify(articleConf.category),
          id: myUtils.slugify(articleConf.category),
          name: myUtils.titlefy(articleConf.category)
        }
        articleConf.tags = articleConf.tags.map(tag => {
          return {
            _id: myUtils.slugify(tag),
            id: myUtils.slugify(tag),
            name: myUtils.camelizefy(tag)
          };
        });

        // to avoid "RangeError: Maximum call stack size exceeded."
        async.setImmediate(function() {
          cb(null, articleConf);
        });
      },

      // 6. Push each articleConf with article content to local db
      function pushArticles2DB(articleConf, cb) {
        async.series([
          function pushArticle(pcb) {
            // Push article
            blog.create(blog.col.ARTICLES, articleConf, (err, doc) => {
              if (err) return pcb({where: 'pushArticle', path: articleConfPath, error: err});
              pcb(null);
            });
          },
          function pushCategory(pcb) {
            // Upsert category...
            // if category exists, append article to list of articles
            // otherwise create a new doc
            blog.upsert(
              blog.col.CATEGORIES,
              articleConf.category._id, {
                _id: articleConf.category._id,
                id: articleConf.category.id,
                name: articleConf.category.name,
                articles: [articleConf._id]
              },
              (err, res) => {
                if (err) return pcb({where: 'pushCategory', path: articleConfPath, error: err});
                pcb(null);
              });
          },
          // Upsert each tag...
          function pushTags(pcb) {
            // Upsert tags...
            async.eachLimit(articleConf.tags, 1,
              function pushTagsIteratee(tag, tagCallback) {
                blog.upsert(
                  blog.col.TAGS,
                  tag._id, {
                    _id: tag._id,
                    id: tag.id,
                    name: tag.name,
                    articles: [articleConf._id]
                  }, (err, res) => {
                    if (err) return tagCallback({tag: tag, error: err});
                    tagCallback(null);
                  }
                );
              },
              function pushTagsCallback(pushTagsErr) {
                if (pushTagsErr) return pcb({where: 'pushTags', path: articleConfPath, error: pushTagsErr});
                pcb(null);
              }
            );
          }
        ], function pushArticleCallback(pushArticleErr, pushArticleRes) {
          if (pushArticleErr) return cb({where: 'pushArticle', path: articleConfPath, error: pushArticleErr});
          cb(null, articleConf);
        });
      },

      // 7. We don't want to serve static files directly from the git repo for few reasons
      // including security and the fact that if a file in a working directory was in use
      // by the blog web app it would block git to update or remove it when syncing repos.
      // Therefore we copy all static files to the respective folder in the temp folder.
      // TODO: currently every time we run article-importer we create a new directory...
      // ...a better strategy would be to update rather than recreate

      // folder name will be: category/article names
      function copyStaticFiles(articleConf, cb) {
        // identify files in root and folders

        // TODO in the future we could support only certain type of "safe" files
        const articleGlobPath =
          path.join(articlePath, '**', '*.*');//FILES.CONF) + `.{${EXTS.CONF.JSON},${EXTS.CONF.YAML}}`;

        glob(articleGlobPath, (articleGlobErr, articleStaticFiles) => {

          if (articleGlobErr) {
            cb({where: 'copyStaticFiles', error: `Error getting static files for article "${articlePath}": ${articleGlobErr}.`});
          }

          // remove articleConf, brief and extended files
          const articleSpecificFiles = [
            articleConfPath,
            path.join(articlePath, articleConf.content.brief),
            path.join(articlePath, articleConf.content.extended)
          ];

          articleStaticFiles = articleStaticFiles.filter(staticFile => {
            return !articleSpecificFiles.some(articleFile => articleFile === staticFile);
          });

          if (!articleStaticFiles.length) return cb(null);

          // here we have a list of all dirs with articleConf files!
          console.log(`articleStaticFiles for "${articlePath}": ${articleStaticFiles}`);
          console.log('==============================');

          const targetArticlePath = path.join(conf.app.paths.staticFilesDir, articleConf.category._id, articleConf._id);

          // create article folder

          // Copy each file to a respective folder
          async.eachSeries(articleStaticFiles,
            function copyStaticFilesForArticle(filePath, copyStaticFileCb) {
            // ignore articleConf and brief and extended files
            //console.log(filePath)
            //let grzyb = path.join(articlePath, articleConf.content.brief)
            //console.log(grzyb);
            ////debugger;
            ///Users/wsierak/Projects/learning/heyka/_sample-blog-local-repo/tips/2017-03-06_testing-articles-with-images/assets/large_img1.jpg
            ///Users/wsierak/Projects/learning/heyka/_sample-blog-local-repo/tips/2017-03-06_testing-articles-with-images/brief.html

            const fileDir = path.relative(articlePath, path.dirname(filePath));
            //debugger;
            const targetPath = path.join(targetArticlePath, fileDir, path.basename(filePath));

            fs.copy(filePath, targetPath, fileCpErr => {
              if (fileCpErr) return copyStaticFileCb(fileCpErr);
              copyStaticFileCb(null);
            });
          }, function copyStaticFilesForArticleCallback(copyStaticFilesErr, res) {
            if (copyStaticFilesErr) {
              // One of the iterations produced an error.
              // All processing will now stop.
              console.log('*** A file failed to process:', copyStaticFilesErr);
              return cb({where: 'copyStaticFiles', error: `Error copying files for "${articlePath}": ${copyStaticFilesErr}.`})
            }
            console.log(`All files static files for ${articlePath} have been copied successfully.`);
            cb(null, articleConf);
          });
        });
      },
    ], function waterfallCallback(waterfallErr, waterfallRes) {
      if (waterfallErr) return loadArticleCb(waterfallErr);
      console.log(`* Completed importing article: ${articleConfPath}.`);
      // //console.log('* full conf:', waterfallRes);
      // console.log('------------------------------');

      loadArticleCb(null, articleConfPath);
    });
  }
}

module.exports = ArticleImporter;
