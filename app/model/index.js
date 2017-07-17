const DBPool = require('./db-pool');
const BlogDB = require('./db-pouch');
//const blogDB = new BlogDB();

// const ArticleImporter = require('../article-importer');
// const articleImporter = new ArticleImporter();

const NOT_INITIALISED = 0;
const INITIALISING = 1;
const RUNNING = 2;
const UPDATING = 3;

//////////////////////////////////
// 20170612 testing article importer orchestrator
//////////////////////////////////
const path = require('path');
const conf = require('../config');
const orchestrator = require('../article-importer/orchestrator');

//////////////////////////////////

let instance = null;

// singleton
class Model {
  constructor() {
    if (instance) return instance;
    instance = this;
    instance.dbPool = new DBPool(BlogDB);
    instance.status = NOT_INITIALISED;
  }

  static get model() {
    return new Model();
  }

  setContentProvider(cp) {
    instance.cp = cp;
  }

  init(cb) {
    if (instance.status !== NOT_INITIALISED) {
      return cb({code: 'model.01', msg: 'Trying to init model that is already initialised.'});
    }
    instance.status = INITIALISING;
    //blogDB.init(cb);
    instance.dbPool.getNextDb((poolErr, db) => {
      if (poolErr) return cb(poolErr);
      //////////////////////// 20170612
      //articleImporter.initialImport(db, importErr => {
      orchestrator.fullImport(instance.cp, db, importErr => {
      ////////////////////////
        if (importErr) return cb(importErr);
        instance.dbPool.swapDb(swapErr => {
          if (swapErr) return cb(swapErr);
          instance.status = RUNNING;
          debugger;
          cb(null);
        });
      });
    });
  }

  static update(cb) {
    console.log('\n\n\n INSIDE UPDATE \n\n\n')
    if (instance.status !== RUNNING) {
      return cb({code: 'model.02', msg: 'Trying to update model that isn\'t initialised yet.'});
    }
    instance.dbPool.getNextDb((poolErr, db) => {
      if (poolErr) return cb(poolErr);
      instance.status = UPDATING;

      //articleImporter.initialImport(db, importErr => {
      orchestrator.fullImport(instance.cp, db, importErr => {
        if (importErr) {
          console.log('** Error something went wrong with import while updating.', importErr);
          // TODO destroy db to allow next update in the future
          return cb(importErr);
        }
        instance.dbPool.swapDb(swapErr => {
          if (swapErr) return cb(swapErr);
          instance.status = RUNNING;
          cb(null);
        });
      });
    });
  }

  getName() {
    return instance.dbPool.db.name;
  }

  findOne(collection, docId, cb) {
    return instance.dbPool.db.findOne(collection, docId, cb);
  }

  find(collection, filter, queryOptions, cb) {
    return instance.dbPool.db.find(collection, filter, queryOptions, cb);
  }

  count(collection, filter, cb) {
    return instance.dbPool.db.count(collection, filter, cb);
  }

  get col() {
    return instance.dbPool.db.col;
  }
}

module.exports = Model;

// module.exports = {
//   init: (cb) => {
//     if (modelStatus !== NOT_INITIALISED) {
//       return cb({code: 'model.01', msg: 'Trying to init model that is already initialised.'});
//     }
//     modelStatus = INITIALISING;
//     //blogDB.init(cb);
//     dbPool.getNextDb((poolErr, db) => {
//       if (poolErr) return cb(poolErr);
//       articleImporter.initialImport(db, importErr => {
//         if (importErr) return cb(importErr);
//         dbPool.swapDb(swapErr => {
//           if (swapErr) return cb(swapErr);
//           modelStatus = RUNNING;
//           cb(null);
//         });
//       });
//     });
//   },
//   update: (cb) => {
//     if (modelStatus !== RUNNING) {
//       return cb({code: 'model.02', msg: 'Trying to update model that isn\'t initialised yet.'});
//     }
//     dbPool.getNextDb((poolErr, db) => {
//       if (err) return cb(err);
//       modelStatus = UPDATING;
//       articleImporter.initialImport(db, importErr => {
//         if (importErr) return cb(importErr);
//         dbPool.swapDb(swapErr => {
//           if (swapErr) return cb(swapErr);
//           modelStatus = RUNNING;
//           cb(null);
//         });
//       });
//     });
//   },
//   blogDB: dbPool.db,
//   getBlogDB: function() {return dbPool.db;}
// }
