const ArticleImporter = require('./article-importer');
const BlogDB = require('./db');

let articleImporter;
const blogDB = new BlogDB();

function createViews(cb) {
  const designDoc = {
    _id: '_design/articles',
    views: {
      byCategoryPublishedDate: {
        map: (function mapFun(doc) {
          emit([doc.category._id, doc.publishedDate]);
          //emit(doc.category, null)
        }).toString()
      }
    }
  };
  blogDB.articles.put(designDoc, err => {
    if (err) cb({where: "createViews", err: err});
    // console.log('---------->design doc uploaded');
    //
    // blogDB.articles.get('_design/articles', (err, res) => {
    //   if (err) return cb(err);
    //   console.log('=======> ', res)
    //   cb();
    // });
    cb();
  });
}

module.exports = {
  init: (repoPath, cb) => {
    createViews(() => {
      articleImporter = new ArticleImporter(repoPath, blogDB);
      articleImporter.initialImport(cb);
    });
  },
  update: (cb) => articleImporter.repoUpdatedImport(cb),
  db: blogDB
}
