// pouchdb-node:
// https://pouchdb.com/custom.html
//
// pouchdb on memdown:
// https://www.npmjs.com/package/pouchdb-adapter-memory
// https://pouchdb.com/adapters.html#pouchdb_in_node_js

const PouchDB = require('pouchdb-node');
PouchDB.plugin(require('pouchdb-adapter-memory'));

class BlogDB {
  constructor() {
    this._articles = new PouchDB('articles', {adapter: 'memory'});
    this._categories = new PouchDB('categories', {adapter: 'memory'});
    this._tags = new PouchDB('tags', {adapter: 'memory'});
  }

  get articles() {
    return this._articles;
  }

  get categories() {
    return this._categories;
  }

  get tags() {
    return this._tags;
  }
}

module.exports = BlogDB;
