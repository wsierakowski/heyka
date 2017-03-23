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

class DBPool {
  constructor(DB) {
    this._DB = DB;
    this._pool = [null, null];
    this._info = [this.status.FREE, this.status.FREE];
  }

  get status() {
    return {
      FREE: 0,
      LOADING: 1,
      RUNNING: 2,
      DESTROYING: 3
    };
  }

  get db() {
    const runningIdx = this._info.indexOf(this.status.RUNNING);
    if (runningIdx === -1) return null;
    return this._pool[runningIdx];
  }

  getNextDb(cb) {
    const freeIdx = this._info.indexOf(this.status.FREE);
    if (freeIdx === -1) return null;
    this._pool[freeIdx] = new this._DB();
    this._info[freeIdx] = this.status.LOADING;
    this._pool[freeIdx].init(err => {
      if (err) return cb(err);
      return cb(null, this._pool[freeIdx]);
    });
  }

  swapDb(cb) {
    const loadingIdx = this._info.indexOf(this.status.LOADING);
    if (loadingIdx === -1) return null;
    const runningIdx = this._info.indexOf(this.status.RUNNING);
    if (runningIdx === -1) throw 'Error: no running db instance found in the DBPool.';

    this._info[loadingIdx] = this.status.RUNNING;
    this._info[runningIdx] = this.status.DESTROYING;

    this._pool[loadingIdx].destroy(err => {
      if (err) return cb(err);
      this._pool[runningIdx] = null;
      this._info[runningIdx] = this.status.FREE;
      cb(null);
    });
  }

}
