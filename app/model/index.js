//const ArticleImporter = require('./article-importer');
const BlogDB = require('./db-pouch');
const blogDB = new BlogDB();

let articleImporter;
const tempDB = {
  articles: blogDB._getCollection('articles'),
  categories: blogDB._getCollection('categories'),
  tags: blogDB._getCollection('tags')
};

module.exports = {
  init: (/*repoPath, */cb) => {
    blogDB.init(cb);
    // blogDB.init(() => {
    //   articleImporter = new ArticleImporter(repoPath, tempDB);
    //   articleImporter.initialImport(cb);
    // });
  },
  //update: (cb) => articleImporter.repoUpdatedImport(cb),
  db: tempDB,
  blogDB: blogDB
}
