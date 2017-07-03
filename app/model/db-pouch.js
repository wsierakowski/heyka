// pouchdb-node:
// https://pouchdb.com/custom.html
//
// pouchdb on memdown:
// https://www.npmjs.com/package/pouchdb-adapter-memory
// https://pouchdb.com/adapters.html#pouchdb_in_node_js

const async = require('async');
const PouchDB = require('pouchdb-node');
PouchDB.plugin(require('pouchdb-adapter-memory'));

const DBInterface = require('./db-interface');

// TODO: return articles with state published only
// or actually don't even load articles that aren't state published into db?
const articlesDesignDoc = {
  _id: '_design/articles',
  views: {
    all: {
      map: (function mapFun(doc) {
        emit([doc.config.publishedDate, doc.category.id]);
      }).toString(),
      //http://stackoverflow.com/questions/33902858/couchdb-returns-wrong-total-rows
      reduce: '_count'
    },
    byCategory: {
      map: (function mapFun(doc) {
        emit([doc.category.id, doc.config.publishedDate]);
        //emit(doc.category, null)
      }).toString(),
      //http://stackoverflow.com/questions/33902858/couchdb-returns-wrong-total-rows
      reduce: '_count'
    },
    byTag: {
      map: (function mapFun(doc) {
        if (doc.tags.length > 0) {
          for (var i in doc.tags) {
            emit([doc.tags[i].id, doc.config.publishedDate]);
          }
        }
      }).toString(),
      reduce: '_count'
    }
  }
};

class DBPouch extends DBInterface {
  constructor(name) {
    super(name);
    this._initialised = false;
    this._entities = {};
    this._entities.articles = new PouchDB('articles' + name, {adapter: 'memory'});
    this._entities.categories = new PouchDB('categories' + name, {adapter: 'memory'});
    this._entities.tags = new PouchDB('tags' + name, {adapter: 'memory'});
  }

  _checkInitialised() {
    if (!this._initialised) throw `Database not initialised while attepting to execute operation.`;
  }

  _getCollection(collection) {
    if (!this._entities[collection]) {
      throw `Invalid collection: ${collection}.`
    }
    return this._entities[collection];
  }

  _createArticleViews(cb) {
    this._entities.articles.put(articlesDesignDoc, err => {
      if (err) cb({where: 'createArticleViews', err: err});
      cb(null);
    });
  }

  init(cb) {
    this._createArticleViews((err) => {
      if (err) return cb(err);
      this._initialised = true;
      cb(null);
    });
  }

  findOne(collection, docId, cb) {
    this._checkInitialised();
    const coll = this._getCollection(collection);

    coll.get(docId, cb);
  }

  find(collection, filter, queryOptions, cb) {
    if (typeof filter === 'function') {
      cb = filter;
      filter = {};
      queryOptions = {};
    } else if (typeof queryOptions === 'function') {
      cb = queryOptions;
      queryOptions = {};
    }
    this._checkInitialised();
    const coll = this._getCollection(collection);

    const resCb = (err, res) => {
      if (err) return cb(err);
      cb(null, res.rows);
    }

    const opts = {
      include_docs: true,
      reduce: false,
      descending: queryOptions.direction === -1,
      skip: queryOptions.skip,
      limit: queryOptions.limit
    };

    if (collection === this.col.ARTICLES) {

      let viewType = 'articles/all';

      if (filter) {
        if (filter.category) {
          viewType = 'articles/byCategory'
        } else if (filter.tag) {
          viewType = 'articles/byTag';
        }

        let catOrTagVal;
        if (catOrTagVal = filter.category || filter.tag) {
          if (opts.descending) {
            opts.startkey = [catOrTagVal, {}];
            opts.endkey = [catOrTagVal];
          } else {
            opts.startkey = [catOrTagVal];
            opts.endkey = [catOrTagVal, {}];
          }
        }
      }

      coll.query(viewType, opts, resCb);
    } else {
      coll.allDocs(opts, resCb);
    }
  }

  count(collection, filter, cb) {
    if (collection !== 'articles') cb(`Collection '${collection}' isn't supported in find operation.`);
    this._checkInitialised();
    const coll = this._getCollection(collection);

    const opts = {
      reduce: true
    };

    let viewType = 'articles/all';
    if (filter) {
      if (filter.category) {
        viewType = 'articles/byCategory'
      } else if (filter.tag) {
        viewType = 'articles/byTag';
      }
      let catOrTagVal;
      if (catOrTagVal = filter.category || filter.tag) {
        opts.startkey = [catOrTagVal];
        opts.endkey = [catOrTagVal, {}];
      }
    }

    coll.query(viewType, opts, (err, res) => {
      if (err) return cb(err);
      let resCount = (res.rows.length > 0) ? res.rows[0].value : 0;
      cb(null, resCount);
    });
  }

  create(collection, doc, cb) {
    this._checkInitialised();
    const coll = this._getCollection(collection);

    // for pouchdb
    doc._id = doc.id;

    coll.put(doc, cb);
  }

  upsert(collection, docId, newDoc, cb) {
    this._checkInitialised();
    const coll = this._getCollection(collection);

    // TODO: why do we need the docId here if it is also present in the newDoc?

    // for pouchdb
    newDoc._id = newDoc.id;

    coll.get(docId, (err, doc) => {
      // document doesn't exists yet so create new one
      if (err) {
        doc = newDoc;
        doc._id = docId;
      } else {
        // otherwise update it - a bit hacky implementation but ok for this requirement
        Object.keys(newDoc).forEach(function (key) {
          if (doc[key] && Array.isArray(doc[key]) && Array.isArray(newDoc[key])) {
            newDoc[key].forEach(item => {
              doc[key].push(item);
            });
          } else {
            doc[key] = newDoc[key];
          }
        });
      }
      coll.put(doc, (putErr, res) => {
        if (putErr) return cb(putErr);
        cb(null, res);
      });
    });
  }

  destroy(cb) {
    async.eachSeries(
      Object.keys(this.col),
      (key, asCb) => {
        this._getCollection(this.col[key]).destroy(asCb);
      },
      (err) => {
        return cb(err);
      }
    );
  }
}

module.exports = DBPouch;
