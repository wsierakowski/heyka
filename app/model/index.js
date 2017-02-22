const ArticleImporter = require('./article-importer');
const BlogDB = require('./db');

let articleImporter;
const blogDB = new BlogDB();

function createViews() {
  const designDoc = {
    _id: '_design/articles',
    views: {
      byPublishedDate: {
        map: function mapFun(doc) {
          if (doc.publishedDate) {
            emit(doc.publishedDate);
          }
        }
      }
    }
  };
  blogDB.articles.put(ddoc, err => {
    if (err) {
      throw {where: "createViews", err: err};
    }
  });
}

module.exports = {
  init: (repoPath, cb) => {
    articleImporter = new ArticleImporter(repoPath, blogDB);
    articleImporter.initialImport(cb);
    //createViews();
  },
  update: (cb) => articleImporter.repoUpdatedImport(cb),
  db: blogDB
}
