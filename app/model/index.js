const DBPool = require('./db-pool');
const BlogDB = require('./db-pouch');
//const blogDB = new BlogDB();

const ArticleImporter = require('../article-importer');
const articleImporter = new ArticleImporter();

const dbPool = new DBPool(BlogDB);

const NOT_INITIALISED = 0;
const INITIALISING = 1;
const RUNNING = 2;
const UPDATING = 3;
var modelStatus = NOT_INITIALISED;

class Model {
  constructor() {}

  static init(cb) {
    if (modelStatus !== NOT_INITIALISED) {
      return cb({code: 'model.01', msg: 'Trying to init model that is already initialised.'});
    }
    modelStatus = INITIALISING;
    //blogDB.init(cb);
    dbPool.getNextDb((poolErr, db) => {
      if (poolErr) return cb(poolErr);
      articleImporter.initialImport(db, importErr => {
        if (importErr) return cb(importErr);
        dbPool.swapDb(swapErr => {
          if (swapErr) return cb(swapErr);
          modelStatus = RUNNING;
          cb(null);
        });
      });
    });
  }

  static update(cb) {
    console.log('\n\n\n INSIDE UPDATE \n\n\n')
    if (modelStatus !== RUNNING) {
      return cb({code: 'model.02', msg: 'Trying to update model that isn\'t initialised yet.'});
    }
    dbPool.getNextDb((poolErr, db) => {
      if (poolErr) return cb(poolErr);
      modelStatus = UPDATING;

      articleImporter.initialImport(db, importErr => {
        if (importErr) {
          console.log('** Error something went wrong with import while updating.', importErr);
          // TODO destroy db to allow next update in the future
          return cb(importErr);
        }
        dbPool.swapDb(swapErr => {
          if (swapErr) return cb(swapErr);
          modelStatus = RUNNING;
          cb(null);
        });
      });
    });
  }

  static getName() {
    return dbPool.db.name;
  }

  static findOne(collection, docId, cb) {
    return dbPool.db.findOne(collection, docId, cb);
  }

  static find(collection, filter, queryOptions, cb) {
    return dbPool.db.find(collection, filter, queryOptions, cb);
  }

  static count(collection, filter, cb) {
    return dbPool.db.count(collection, filter, cb);
  }

  static get col() {
    return dbPool.db.col;
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
