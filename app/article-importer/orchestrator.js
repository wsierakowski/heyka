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

const conf = require('conf');

const log = bunyan.createLogger({name: 'heyka:article-importer'});


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

const fullImport = function(contentProvider, db, ficb) {
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
    getArticles: function(cb) {
      const exts = Object.keys(EXTS.CONFIG).map(item => EXTS.CONFIG[item]);
      contentProvider.getArticleDirs(FILES.CONFIG, exts, (err, res) => {
        if (err) {
          log.error({where: 'fullImport.getArticles', err: err});
          // TODO: cancel whole import process
        }
      });
    },
    cleanupUnusedStaticDirs: function(cb) {

    }
  }, function(err, res) {
    // full import finished
    if (err) {
      log.err(err);
      return ficb(err);
    }
    log.info(`Finished old static folders cleaup.`);
  });
}
