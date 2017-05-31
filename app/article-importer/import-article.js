module.exports = (cp, db) => {
  return (article, iacb) => {
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
      // validate
    });
  };
