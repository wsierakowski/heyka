const ArticleImporter = require('./article-importer');
const BlogDB = require('./db');

let articleImporter;
const blogDB = new BlogDB();

module.exports = {
  init: (repoPath, cb) => {
    articleImporter = new ArticleImporter(repoPath, blogDB);
    articleImporter.initialImport(cb);
  },
  update: (cb) => articleImporter.repoUpdatedImport(cb),
  db: blogDB
}
