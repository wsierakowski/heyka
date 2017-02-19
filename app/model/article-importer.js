// TODO rewrite using async await:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const async = require('async');
const YAML = require('yamljs');
const slug = require('slug');

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
  const globPath =
    path.join(dirPath, '**', FILES.CONF) + `.{${EXTS.CONF.JSON},${EXTS.CONF.YAML}}`;

  // 1. Locate all directories with conf files
  glob(globPath, (globErr, articleConfPaths) => {

    if (globErr) throw `Error getting configuration files for articles: ${globErr}.`;

    // here we have a list of all dirs with conf files!
    console.log(`articleConfPaths: ${articleConfPaths}`);
    console.log('==============================')

    // 2. Load articles - each is represented by a configuration file
    async.eachSeries(articleConfPaths, loadArticle(db), (loadArticlesErr, res) => {
      if (loadArticlesErr) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('*** A file failed to process:', loadArticlesErr);
        return cb(loadArticlesErr)
      }
      console.log('All files have been processed successfully.');
      cb(null);
    });
  });
}

function repoUpdatedImport(cb) {
  cb('Not implemented');
}

function loadArticle(db) {
  return function (articleConfPath, loadArticleCb) {

    let confExt = path.extname(articleConfPath).toLowerCase();

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
        let dirname = path.dirname(articleConfPath);
        async.map([
          path.join(dirname, conf.content.brief),
          path.join(dirname, conf.content.extended)
        ],
        fs.readFile,
        (err, res) => {
          if (err) return cb({where: 'readBriefAndExtended', path: articleConfPath, error: err});
          conf.content.briefBody = res[0].toString();
          conf.content.extendedBody = res[1].toString();
          cb(null, conf);
        });
      },

      // 5. Do all necessary processing on the conf before it is passed to db
      function processConf(conf, cb) {
        conf._id = slug(conf.title);
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
            db.categories.get(conf.category, (err, doc) => {
              if (err) {
                doc = {
                  _id: conf.category,
                  name: conf.category, // add util for capitalizing first letter with inflection module
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
                db.tags.get(tag, (err, doc) => {
                  if (err) {
                    doc = {
                      _id: tag,
                      name: tag,
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
      }
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
