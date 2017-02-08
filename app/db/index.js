// pouchdb-node:
// https://pouchdb.com/custom.html
//
// pouchdb on memdown:
// https://www.npmjs.com/package/pouchdb-adapter-memory
// https://pouchdb.com/adapters.html#pouchdb_in_node_js
//
// TODO rewrite using async await:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const async = require('async');
const YAML = require('yamljs');
const slug = require('slug');

const rootdir = process.cwd();
const PouchDB = require('pouchdb-node');
PouchDB.plugin(require('pouchdb-adapter-memory'));

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

const articles = new PouchDB('articles', {adapter: 'memory'});
const categories = new PouchDB('categories', {adapter: 'memory'});
const tags = new PouchDB('tags', {adapter: 'memory'});

function validateConfObj(conf) {
  if (!conf || typeof conf !== 'object') {
    return ['Configuration object not an object.'];
  }
  const rules = [
    {name: 'author.name', type: 'string'},
    {name: 'category', type: 'string'},
    {name: 'content.brief', type: 'string'},
//      {name: 'content.briefType', type: 'string'},
    {name: 'content.extended', type: 'string'},
    {name: 'content.extendedType', type: 'string'},
    {name: 'publishedDate', type: 'string'},
    {name: 'state', type: 'string'},
    {name: 'tags', type: 'arrayOfStrings'},
    {name: 'title', type: 'string'}
  ];

  const validators = {
    'string': function(v) {return typeof v === 'string';},
    'object': function(v) {return typeof v === 'object' && !Array.isArray(v)},
    'array': function(v) {return Array.isArray(v)},
    'arrayOfStrings': function(v) {return this.array(v) && v.every(i => this.string(i));}
  };

  let res = [];
  rules.forEach(rule => {
    let splitName = rule.name.split('.');
    if (conf[splitName[0]] === undefined) {
      res.push(`${splitName[0]} is not a(n) ${rule.type}.`);
    }
    // we know this is always two level depth so we are simplifying this...
    else if (splitName.length < 2) {
      if (!validators[rule.type](conf[rule.name])) {
        res.push(`${rule.name} is not a(n) ${rule.type}.`);
      }
    } else {
      if (!validators.object(conf[splitName[0]])) {
        res.push(`${splitName[0]} is not a(n) object.`);
      } else {
        if (!validators[rule.type](conf[splitName[0]][splitName[1]])) {
          res.push(`${rule.name} is not a(n) ${rule.type}.`);
        }
      }
    }
  });
  return res;
}

// 1. Locate all directories with conf files
glob(path.join(rootdir, '_sample-blog-local-repo', '**', 'conf') + '.{json,yaml}', (globErr, articleConfPaths) => {

  if (globErr) throw "Error getting configuration files for articles.";

  // here we have a list of all dirs with conf files!
  console.log(`articleConfPaths: ${articleConfPaths}`);
  console.log('==============================')

  // 2. Load articles - each is represented by a configuration file
  async.eachLimit(articleConfPaths, 5, function loadArticlesIteratee(articleConfPath, articleCb) {

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
        function validateConfig(conf, cb) {
          let res = validateConfObj(conf);
          if (res.length > 0) {
            return cb({where: 'validateConfig', path: articleConfPath, error: res.join('.\n')});
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
              articles.put(conf, (err, doc) => {
                if (err) return pcb({where: 'pushArticle', path: articleConfPath, error: ierr});
                pcb(null);
              });
            },
            function pushCategory(pcb) {
              // Upsert category...
              // if category exists, append article to list of articles
              // otherwise create a new doc
              categories.get(conf.category, (err, doc) => {
                if (err) {
                  doc = {
                    _id: conf.category,
                    articles: [conf._id]
                  };
                } else {
                  doc.articles.push(conf._id);
                }
                categories.put(doc, (ierr, res) => {
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
                  tags.get(tag, (err, doc) => {
                    if (err) {
                      doc = {
                        _id: tag,
                        articles: [conf._id]
                      };
                    } else {
                      doc.articles.push(conf._id);
                    }
                    tags.put(doc, (ierr, res) => {
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
        if (waterfallErr) return articleCb(waterfallErr);
        console.log('* path:', articleConfPath);
        //console.log('* full conf:', waterfallRes);
        console.log('------------------------------');
        articleCb(null, waterfallRes);
      });
    }, function loadArticlesCallback(loadArticlesErr, res) {
      // if any of the file processing produced an error, err would equal that error
      if (loadArticlesErr) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('*** A file failed to process:', loadArticlesErr);
      } else {
        console.log('All files have been processed successfully:', res);
      }
    });
});
