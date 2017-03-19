// pouchdb-node:
// https://pouchdb.com/custom.html
//
// pouchdb on memdown:
// https://www.npmjs.com/package/pouchdb-adapter-memory
// https://pouchdb.com/adapters.html#pouchdb_in_node_js

var DBPouch = require('./db-pouch');

//const PouchDB = require('pouchdb-node');
//PouchDB.plugin(require('pouchdb-adapter-memory'));

class BlogDB {
  constructor() {
    this.dbPouch = new DBPouch();
    this._articles = this.dbPouch._getCollection('articles');//new PouchDB('articles', {adapter: 'memory'});
    this._categories = this.dbPouch._getCollection('categories');//new PouchDB('categories', {adapter: 'memory'});
    this._tags = this.dbPouch._getCollection('tags');//new PouchDB('tags', {adapter: 'memory'});
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
