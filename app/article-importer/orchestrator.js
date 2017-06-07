/*

db, cb

-----------------
db
db.name
db.count ?
db.col.ARTICLES
db.col.CATEGORIES
db.col.TAGS
db.create
db.upsert
-----------------
conf.app.paths
conf.app.paths.localRepoDir
conf.app.paths.staticFilesDir
conf.app.paths.staticFilesPrefix
-----------------
contentProvider
contentProvider.getArticleDirs(['FILES.CONFIG'], ['EXTS.CONFIG.JSON', 'EXTS.CONFIG.YAML'])
[{
  dirPath: '/news/20170522-nodejs-meetup',
  confFile: 'conf.json',
  conf: {} //conf object
  staticFiles: ['brief.md', 'extended.md', 'imgs/diagram1.png']
}]
contentProvider.getFileStream(path)
contentProvider.getFileAsync(path)
-----------------

1. Preimport tasks:
1.1. create tempDir dir
1.2. create staticFilesDir + db.name

2. * Get paths to all conf files along with folder content

3. Loop through each conf file path and call load article
   If any of the load article tasks fail, cancel full process
3.1  * readConfFile
3.2    parseConf (JSON or YAML)
3.3    validateConf
3.4    preprocessConf
3.5    skipArticleIfNotPublished
3.6  * readBriefAndExtended
3.6.1  * read file to memory = fs.read or request
3.7    preImportTasks
3.8    pushArticleToDB
3.8.1    pushArticle
3.8.2    pushCategory
3.8.3    pushTags
3.9  * copyStaticFiles
3.9.1    getAllFilesInArticleDir except of conf and brief and extended
3.9.2    create conf.app.paths.staticFilesDir + '_' + db.name, articleConf.category._id, articleConf._id
3.9.3  * copyEachFile - read from source, copy to destination, stream pipe from fs.read or request

4. Remove old static files dirs (all dirs with staticFilesPrefix other than staticFilesDir + db.name)

5. Finish

-----------------

*/

const fse = require('fs-extra');
const path = require('path');
const async = require('async');
const bunyan = require('bunyan');

const conf = require('../config');
const importArticle = require('./import-article');
const validateArticleConf = require('./article-conf-validator');
const Article = require('./article-doc-class');

const log = bunyan.createLogger({name: 'heyka:article-importer-orchestrator'});

const FILES = {
  CONFIG: ['conf', 'config'],
  BRIEF: 'brief', // TODO: this shouldn't be needed
  EXTENDED: 'extended' // TODO: this shouldn't be needed
};

const EXTS = {
  CONFIG: {JSON: 'json', YAML: 'yaml'},
  BRIEF: {HTML: 'html', MD: 'md'},
  EXTENDED: {HTML: 'html', MD: 'md'}
};
EXTS.CONFIG_LIST: Object.keys(EXTS.CONFIG).map(item => EXTS.CONFIG[item]),

// IMPORT PROCESS

const fullImport = function(contentProvider, db, fullImportCb) {

  async.series({

    createTempDir: function(cb) {
      log.info({where: 'fullImport', msg: `1. Creating temp dir: ${conf.app.paths.tempDir}`});
      fse.ensureDir(conf.app.paths.tempDir, cb);
    },

    createStaticFilesDir: function(cb) {
      const staticFilesDir = conf.app.paths.staticFilesDir + '_' + db.name;
      log.info(`2. Creating static files dir: ${staticFilesDir}`);
      fse.ensureDir(staticFilesDir, cb)
    },

    importArticles: function(cb) {
      contentProvider.GetArticleConfPaths(FILES.CONFIG, EXTS.CONFIG_LIST, (err, articleConfPaths) => {
        if (err) {
          log.error({where: 'fullImport.importArticles', err: err});
          return cb(err);
          // TODO: cancel whole import process
        }

        if (articleConfPaths.length === 0) {
          const noArticlesError = {where: 'fullImport.importArticles', msg: "No articles found."};
          log.error(noArticlesError);
          return cb(noArticlesError.msg);
          // TODO: cancel whole import process
        }

        async.eachSeries(articleConfPaths, importArticle, importArticleErr => {
          if (importArticleErr) {
            log.error({where: 'fullImport.importArticles', err: importArticleErr});
            return cb(importArticleErr);
            // TODO: cancel whole import process
          }
          cb();
        });
      });
    },

    cleanupUnusedStaticDirs: function(cb) {
      // TODO
    }

  }, function(err, res) {
    // full import finished
    if (err) {
      log.error(err);
      return fullImportCb(err);
    }
    log.info(`Finished old static folders cleaup.`);
  });



  // IMPORT ARTICLE STEPS


  function readParseAndValidateConfFile(article, cb) {
    contentProvider.readFile(articleConfPath, (err, confData) => {

      article.config = parseConfFile(confData, path.extname(article.confFile));

      // parse
      const confExt = path.extname(article.confFile);
      try {
        article.config = confExt === `.${EXTS.CONFIG.JSON}` ?
          JSON.parse(confData) : YAML.parse(confData);
      } catch(parseError) {
        return cb({where: 'readAndValidateConfFile', path: articleConfPath, error: parseError});
      }

      //validate
      const validateErrors = validateArticleConf(article.config);
      if (validateErrors.length > 0) {
        return cb({where: 'validateArticleConfig', path: articleConfPath, error: validateErrors.join('.\n')});
      }

      cb(null);
    });
  }

  function preprocessAndSkip(importArticleCallback) {
      (article, cb) => {
      // preprocess
      if (article.config.published === undefined) {
        article.config.published = true;
      }
      // skip
      if (!article.config.published) {
        log.info(`* ArticleImporter: skipping article: "${article.dirPath}" as it is not set to be published.`);
        // http://stackoverflow.com/questions/15420019/asyncjs-bypass-a-function-in-a-waterfall-chain
        // https://github.com/caolan/async/pull/85
        return importArticleWaterfallCallback(importArticleCallback)(null);
      }

      // to avoid "RangeError: Maximum call stack size exceeded."
      async.setImmediate(function() {
        cb(null);
      });
    }
  }

  function readBriefAndExtended(article, cb) {
    async.map([
      path.join(article.dirPath, article.config.content.brief),
      path.join(article.dirPath, article.config.content.extended)
    ],
    contentProvider.readFile,
    (err, data) => {
      if (err) {
        return cb({where: 'readBriefAndExtended', path: articleConfPath, error: err});
      }
      let briefBody = res[0].toString();
      if (briefExt === '.' + EXTS.BRIEF.HTML) article.brief = briefBody;
      else if (briefExt === '.' + EXTS.BRIEF.MD) article.brief = marked(briefBody);
      else return cb({
        where: 'readBriefAndExtended',
        path: articleConfPath,
        error: `Unsupported brief file type ${article.config.content.brief}`}
      );

      let extendedBody = res[1].toString();
      if (extendedBody) article.config.content.isExtended = true; // TODO is this necessary
      if (extendedExt === '.' + EXTS.EXTENDED.HTML) article.extended = extendedBody;
      else if (extendedExt === '.' + EXTS.EXTENDED.MD) article.extended = marked(extendedBody);
      else return cb({
        where: 'readBriefAndExtended',
        path: articleConfPath,
        error: `Unsupported extended file type ${article.config.content.extended}`}
      );
      cb(null);
    });
  }

  // All necessary processing on the articleConf before it is passed to db
  function postprocess(article, cb) {
    article._id = article.slug = myUtils.slugify(article.config.title);

    // TODO rething whether we still need to keep almost entire category doc in article
    // after we changed the way how we query articles by category...
    article.category = {
      id: myUtils.slugify(article.config.category),
      name: myUtils.titlefy(article.config.category)
    }
    article.tags = article.config.tags.map(tag => {
      return {
        id: myUtils.slugify(tag),
        name: myUtils.camelizefy(tag)
      };
    });

    // to avoid "RangeError: Maximum call stack size exceeded."
    async.setImmediate(function() {
      cb(null);
    });
  }

  function insertArticlesToDB(article, cb) {
    async.series([
      function pushArticle(icb) {
        db.create(db.col.ARTICLES, article, (err, doc) => {
          if (err) return icb({where: 'insertArticlesToDB', path: articleConfPath, error: err});
          icb(null);
        });
      },
      function pushCategory(icb) {
        // TODO: Do we really need a separate category collection?
        // Upsert category...
        // if category exists, append article to list of articles
        // otherwise create a new doc
        db.upsert(
          db.col.CATEGORIES,
          article.category.id, {
            id: article.category.id,
            name: article.category.name,
            articles: [article.id]
          }, (err, res) => {
            if (err) return icb({where: 'pushCategory', path: articleConfPath, error: err});
            icb(null);
          });
      },
      function pushTags(icb) {
        // Upsert tags...
        async.eachLimit(article.tags, 1,
          function pushTagsIteratee(tag, tagCallback) {
            db.upsert(
              db.col.TAGS,
              tag.id, {
                id: tag.id,
                name: tag.name,
                articles: [article.id]
              }, (err, res) => {
                if (err) return tagCallback({tag: tag, error: err});
                tagCallback(null);
              }
            );
          },
          function pushTagsCallback(pushTagsErr) {
            if (pushTagsErr) return icb({where: 'pushTags', path: articleConfPath, error: pushTagsErr});
            icb(null);
          }
        );
      }
    ], function insertArticleSeriesCallback(pushArticleErr, pushArticleRes) {
      if (pushArticleErr) return cb({where: 'pushArticle', path: articleConfPath, error: pushArticleErr});
      cb(null);
    });
  }

  function importArticleWaterfallCallback(cb) {
    return err => {
      if (err) {
        return cb(err);
      }
      cb(null);
    };
  })


  // IMPORT SINGLE ARTICLE

  function importArticle(articleConfPath, cb) {
    const article = new Article();
    article.dirPath = path.dirname(articleConfPath);
    article.confFile = path.basename(articleConfPath);

    log.info({where: 'importArticle', msg: `Loading article: ${articleConfPath}.`});

    async.waterfall([
      wcb => wcb(null, article),
      readParseAndValidateConfFile,
      preprocessAndSkip(cb),
      readBriefAndExtended,
      // All necessary processing on the articleConf before it is passed to db
      postprocess,
      insertArticlesToDB
    ], importArticleWaterfallCallback(cb));
  }
}
