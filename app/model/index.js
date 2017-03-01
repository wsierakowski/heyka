const ArticleImporter = require('./article-importer');
const BlogDB = require('./db');

let articleImporter;
const blogDB = new BlogDB();

// TODO: return articles with state published only
// or actually don't even load artiecles that aren't state published into db?
function createViews(cb) {
  const designDoc = {
    _id: '_design/articles',
    views: {
      byCategory: {
        map: (function mapFun(doc) {
          emit([doc.category._id, doc.publishedDate]);
          //emit(doc.category, null)
        }).toString()
      },
      byTag: {
        map: (function mapFun(doc) {
          if (doc.tags.length > 0) {
            for (var i in doc.tags) {
              emit([doc.tags[i]._id, doc.publishedDate]);
            }
          }
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
