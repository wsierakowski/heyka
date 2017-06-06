/*
remove it
*/

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'heyka:article-importer'});

const validateArticleConf = require('./article-conf-validator');

module.exports = (cp, db, article) => {
  return (article, iacb) => {
    log.info({where: 'articleImporter', msg: `Loading article: ${article.dirPath}.`});
    async.waterfall([
      function injectArticle(icb) {icb(article)};
      readConfFile(cp, db),
      parseConfFile,
    ], err => {
      if (err) {
        return iacb(err);
      }
      iacb();
    });
  };
}

function readConfFile(cp, db) {
  return (article, cb) => {
    cp.getFile(article.confFile, (err, data) => {
      // validate conf file

    });
  };
}
