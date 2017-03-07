// TODO rewrite using async await:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const async = require('async');
const YAML = require('yamljs');
const marked = require('marked');
const os = require('os');
const moment = require('moment');

const myUtils = require('../libs/my-utils');
const myFileUtils = require('../libs/my-fs-utils');
const conf = require('../config');

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
  constructor(repoPath, db) {
    this.repoPath = repoPath;
    this.db = db;
  }

  initialImport(cb) {
    initialImport(this.db, this.repoPath, cb);
  }

  repoUpdatedImport(cb) {
    repoUpdatedImport(this.db, this.repoPath, cb);
  }
}

function initialImport(db, dirPath, cb) {

  // 0. Create folder for static files
  const blogTempDirPath = path.join(
    os.tmpdir(),
    myUtils.slugify(conf.BLOG_TITLE)
  );

  const staticFilesDirPathPrefix = path.join(
    blogTempDirPath,
    conf.STATIC_FILES_DIR_PREFIX
  );

  const staticFilesDirPath = staticFilesDirPathPrefix + moment().toArray().join('-');

  try {
    fs.accessSync(blogTempDirPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      /// && err.message.indexOf('ENOENT: no such file or directory') !== -1) {
      console.log('* 2. Tempdir doesn\'t exist so it needs to be created.');
      fs.mkdirSync(blogTempDirPath);
    } else {
      return cb(`Process doesn't have permission to access ${tempdir}.`);
    }
  }

  fs.mkdirSync(staticFilesDirPath);

  // 1. Locate all directories with conf files
  const globPath =
    path.join(dirPath, '**', FILES.CONF) + `.{${EXTS.CONF.JSON},${EXTS.CONF.YAML}}`;

  glob(globPath, (globErr, articleConfPaths) => {

    if (globErr) throw `Error getting configuration files for articles: ${globErr}.`;

    // here we have a list of all dirs with conf files!
    console.log(`articleConfPaths: ${articleConfPaths}`);
    console.log('==============================')

    // 2. Load articles - each is represented by a configuration file
    async.eachSeries(
      articleConfPaths,
      loadArticle(db, staticFilesDirPath),
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
        glob(staticFilesDirPathPrefix + '*', (oldStaticGlobErr, oldStaticPaths) => {
          oldStaticPaths = oldStaticPaths.filter(staticPath => staticPath !== staticFilesDirPath);

          // async.everySeries doesn't work for some weird reason
          async.every(oldStaticPaths, (filePath, removeCb) => {
              fs.remove(filePath, function(removeErr) {
                if (removeErr) removeCb(removeErr);
                removeCb(null);
              });
            }, (removeSeriesErr, result) => {
              if (removeSeriesErr) return cb(removeSeriesErr);
              cb(null, {staticFilesDirPath: staticFilesDirPath});
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

function loadArticle(db, staticFilesDirPath) {
  return function (articleConfPath, loadArticleCb) {

    const confExt = path.extname(articleConfPath).toLowerCase();
    const articlePath = path.dirname(articleConfPath);

    async.waterfall([

      // 1. Read conf file
      function readConfFile(cb) {
        fs.readFile(articleConfPath, 'utf-8', cb);
      },

      // 2. Parse conf file into obj
      function parseConfFile(content, cb) {
        let parsedConf;
        try {
          parsedConf = confExt === '.json' ?
            JSON.parse(content) : YAML.parse(content);
        } catch(parseError) {
          return cb({where: 'parseConfFile' ,path: articleConfPath, error: parseError});
        }
        // to avoid "RangeError: Maximum call stack size exceeded."
        async.setImmediate(function() {
          cb(null, parsedConf);
        });
      },

      // 3. Validate conf file
      function validateArticleConfig(conf, cb) {
        let res = validateArticleConf(conf);
        if (res.length > 0) {
          return cb({where: 'validateArticleConfig', path: articleConfPath, error: res.join('.\n')});
        }
        // to avoid "RangeError: Maximum call stack size exceeded."
        async.setImmediate(function() {
          cb(null, conf);
        });
      },

      // 4. Read brief and extended content
      function readBriefAndExtended(conf, cb) {
        const briefExt = path.extname(conf.content.brief).toLowerCase();
        const extendedExt = path.extname(conf.content.extended).toLowerCase();
        async.map([
            path.join(articlePath, conf.content.brief),
            path.join(articlePath, conf.content.extended)
          ],
          fs.readFile,
          (err, res) => {
            if (err) return cb({where: 'readBriefAndExtended', path: articleConfPath, error: err});

            let briefBody = res[0].toString();
            if (briefExt === '.' + EXTS.BRIEF.HTML) conf.content.briefBody = briefBody;
            else if (briefExt === '.' + EXTS.BRIEF.MD) conf.content.briefBody = marked(briefBody);
            else return cb({
              where: 'readBriefAndExtended',
              path: articleConfPath,
              error: `Unsupported brief file type ${conf.content.brief}`}
            );

            let extendedBody = res[1].toString();
            if (extendedBody) conf.content.isExtended = true;
            if (extendedExt === '.' + EXTS.EXTENDED.HTML) conf.content.extendedBody = extendedBody;
            else if (extendedExt === '.' + EXTS.EXTENDED.MD) conf.content.extendedBody = marked(extendedBody);
            else return cb({
              where: 'readBriefAndExtended',
              path: articleConfPath,
              error: `Unsupported extended file type ${conf.content.extended}`}
            );

            cb(null, conf);
          }
        );
      },

      // 5. Do all necessary processing on the conf before it is passed to db
      function processConf(conf, cb) {
        conf._id = conf.id = conf.slug = myUtils.slugify(conf.title);
        // TODO rething whether we still need to keep almost entire category doc in article
        // after we changed the way how we query articles by category...
        conf.category = {
          _id: myUtils.slugify(conf.category),
          id: myUtils.slugify(conf.category),
          name: myUtils.titlefy(conf.category)
        }
        conf.tags = conf.tags.map(tag => {
          return {
            _id: myUtils.slugify(tag),
            id: myUtils.slugify(tag),
            name: myUtils.camelizefy(tag)
          };
        });

        // to avoid "RangeError: Maximum call stack size exceeded."
        async.setImmediate(function() {
          cb(null, conf);
        });
      },

      // 6. Push each conf with article content to local db
      function pushArticles2DB(conf, cb) {
        async.series([
          function pushArticle(pcb) {
            // Push article
            db.articles.put(conf, (err, doc) => {
              if (err) return pcb({where: 'pushArticle', path: articleConfPath, error: ierr});
              pcb(null);
            });
          },
          function pushCategory(pcb) {
            // Upsert category...
            // if category exists, append article to list of articles
            // otherwise create a new doc
            db.categories.get(conf.category._id, (err, doc) => {
              if (err) {
                doc = {
                  _id: conf.category._id,
                  id: conf.category.id,
                  name: conf.category.name,
                  articles: [conf._id]
                };
              } else {
                doc.articles.push(conf._id);
              }
              db.categories.put(doc, (ierr, res) => {
                if (ierr) return pcb({where: 'pushCategory', path: articleConfPath, error: ierr});
                pcb(null);
              });
            });
          },
          // Upsert each tag...
          function pushTags(pcb) {
            // Upsert tags...
            async.eachLimit(conf.tags, 1,
              function pushTagsIteratee(tag, tagCallback) {
                db.tags.get(tag._id, (err, doc) => {
                  if (err) {
                    doc = {
                      _id: tag._id,
                      id: tag.id,
                      name: tag.name,
                      articles: [conf._id]
                    };
                  } else {
                    doc.articles.push(conf._id);
                  }
                  db.tags.put(doc, (ierr, res) => {
                    if (ierr) return tagCallback({tag: tag, error: ierr});
                    tagCallback(null);
                  });
                });
              },
              function pushTagsCallback(pushTagsErr) {
                if (pushTagsErr) return pcb({where: 'pushTags', path: articleConfPath, error: pushTagsErr});
                pcb(null);
              }
            );
          }
        ], function pushArticleCallback(pushArticleErr, pushArticleRes) {
          if (pushArticleErr) return cb({where: 'pushArticle', path: articleConfPath, error: pushArticleErr});
          cb(null, conf);
        });
      },

      // 7. We don't want to serve static files directly from the git repo for few reasons
      // including security and the fact that if a file in a working directory was in use
      // by the blog web app it would block git to update or remove it when syncing repos.
      // Therefore we copy all static files to the respective folder in the temp folder.
      // TODO: currently every time we run article-importer we create a new directory...
      // ...a better strategy would be to update rather than recreate

      // folder name will be: category/article names
      function copyStaticFiles(conf, cb) {
        // identify files in root and folders

        // TODO in the future we could support only certain type of "safe" files
        const articleGlobPath =
          path.join(articlePath, '**', '*.*');//FILES.CONF) + `.{${EXTS.CONF.JSON},${EXTS.CONF.YAML}}`;

        glob(articleGlobPath, (articleGlobErr, articleStaticFiles) => {

          if (articleGlobErr) {
            cb({where: 'copyStaticFiles', error: `Error getting static files for article "${articlePath}": ${articleGlobErr}.`});
          }

          // remove conf, brief and extended files
          const articleSpecificFiles = [
            articleConfPath,
            path.join(articlePath, conf.content.brief),
            path.join(articlePath, conf.content.extended)
          ];

          articleStaticFiles = articleStaticFiles.filter(staticFile => {
            return !articleSpecificFiles.some(articleFile => articleFile === staticFile);
          });

          if (!articleStaticFiles.length) return cb(null);

          // here we have a list of all dirs with conf files!
          console.log(`articleStaticFiles for "${articlePath}": ${articleStaticFiles}`);
          console.log('==============================');

          const targetArticlePath = path.join(staticFilesDirPath, conf.category._id, conf._id);

          // create article folder

          // Copy each file to a respective folder
          async.eachSeries(articleStaticFiles,
            function copyStaticFilesForArticle(filePath, copyStaticFileCb) {
            // ignore conf and brief and extended files
            //console.log(filePath)
            //let grzyb = path.join(articlePath, conf.content.brief)
            //console.log(grzyb);
            //debugger;
            ///Users/wsierak/Projects/learning/heyka/_sample-blog-local-repo/tips/2017-03-06_testing-articles-with-images/assets/large_img1.jpg
            ///Users/wsierak/Projects/learning/heyka/_sample-blog-local-repo/tips/2017-03-06_testing-articles-with-images/brief.html

            const fileDir = path.relative(articlePath, path.dirname(filePath));
            debugger;
            const targetPath = path.join(targetArticlePath, fileDir, path.basename(filePath));

            fs.copy(filePath, targetPath, fileCpErr => {
              if (fileCpErr) return copyStaticFileCb(fileCpErr);
              debugger;
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
            cb(null, conf);
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
