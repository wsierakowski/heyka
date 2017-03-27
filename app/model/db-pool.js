class DBPool {
  constructor(DB) {
    this._updateCounter = -1;
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
    if (runningIdx !== -1) return this._pool[runningIdx];

    // return the loading db but only at first initialisation
    // const loadingIdx = this._info.indexOf(this.status.LOADING);
    // if (loadingIdx !== -1) return this._pool[loadingIdx];
    return null;
  }

  getNextDb(cb) {
    const freeIdx = this._info.indexOf(this.status.FREE);
    if (freeIdx === -1) return cb({code: 'DBPool.01', msg: 'No dbs available.'});
    this._updateCounter++;
    const dbName = 'db_(' + this._updateCounter + ')_' + freeIdx;
    console.log(`* DBPool: Initialising next db: ${dbName}.`);
    this._pool[freeIdx] = new this._DB(dbName);
    this._info[freeIdx] = this.status.LOADING;
    this._pool[freeIdx].init(err => {
      if (err) return cb(err);
      console.log(`* DBPool: Next db: ${dbName} initialised.`);
      return cb(null, this._pool[freeIdx]);
    });
  }

  recover(cb) {
    // recovery after failed import
    // remove db with LOADING status and set it as FREE
  }

  swapDb(cb) {
    console.log('* DBPool: Swapping db.');
    const loadingIdx = this._info.indexOf(this.status.LOADING);
    if (loadingIdx === -1) return cb({code: 'DBPool.02', msg: 'No dbs with status LOADING found.'});

    this._info[loadingIdx] = this.status.RUNNING;

    // detect whether this is a first run
    const freeIdx = this._info.indexOf(this.status.FREE);
    if (freeIdx) {
      console.log(`* DBPool: First run, db: ${this._pool[loadingIdx].name} initialised.`);
      return cb(null);
    }

    const runningIdx = this._info.indexOf(this.status.RUNNING);

    if (runningIdx === -1) return cb({code: 'DBPool.03', msg: 'Error: no running db instance found in the DBPool.'});

    this._info[runningIdx] = this.status.DESTROYING;
    console.log('* DBPool: Destroying db.');
    this._pool[loadingIdx].destroy(err => {
      if (err) return cb(err);
      this._pool[runningIdx] = null;
      this._info[runningIdx] = this.status.FREE;
      console.log('* DBPool: Db destroyed.');
      cb(null);
    });
  }
}

module.exports = DBPool;
