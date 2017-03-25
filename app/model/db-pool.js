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
    if (runningIdx !== -1) return this._pool[runningIdx];

    // return the loading db but only at first initialisation
    // const loadingIdx = this._info.indexOf(this.status.LOADING);
    // if (loadingIdx !== -1) return this._pool[loadingIdx];
    return null;
  }

  getNextDb(cb) {
    console.log('* DBPool: Initialising next db.');
    const freeIdx = this._info.indexOf(this.status.FREE);
    if (freeIdx === -1) return cb({code: 'DBPool.01', msg: 'No dbs available.'});
    this._pool[freeIdx] = new this._DB();
    this._info[freeIdx] = this.status.LOADING;
    this._pool[freeIdx].init(err => {
      if (err) return cb(err);
      console.log('* DBPool: Next db initialised.');
      return cb(null, this._pool[freeIdx]);
    });
  }

  swapDb(cb) {
    console.log('* DBPool: Swapping db.');
    const loadingIdx = this._info.indexOf(this.status.LOADING);
    if (loadingIdx === -1) return cb({code: 'DBPool.02', msg: 'No dbs with status LOADING found.'});

    this._info[loadingIdx] = this.status.RUNNING;

    // detect whether this is a first run
    const freeIdx = this._info.indexOf(this.status.FREE);
    if (freeIdx) {
      console.log('* DBPool: Swap run as first run.');
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
