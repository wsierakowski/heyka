const BlogDB = require('./db-pouch');
const blogDB = new BlogDB();

module.exports = {
  init: (cb) => {
    blogDB.init(cb);
  },
  //update: (cb) => articleImporter.repoUpdatedImport(cb),
  blogDB: blogDB
}

// var _db = new PouchDB('foo');
//
// var reset = function() {
//   _db.destroy().then(function() {
//     _db = new PouchDB('foo');
//   });
// };
