const test = require('tape');
const sinon = require('sinon');

const DBPool = require('../../app/model/db-pool');
const BlogDB = require('../../app/model/db-pouch');

const DBStub = function(name) {
  this.name = name;
};

//const spyConstructor = sinon.spy(DBStub);

DBStub.prototype.init = sinon.stub();
DBStub.prototype.init.callsArgWith(0, null);

let destroyCb;
DBStub.prototype.destroy = function(cb) {
  destroyCb = cb;
}
const destroySpy = sinon.spy(DBStub.prototype, 'destroy');

// DBStub.prototype.destroy = sinon.stub();
// DBStub.prototype.destroy.callsArgWith(0, null);


const dbPool = new DBPool(DBStub);

test('test dpPool entire flow', t => {

  // 1. before model init

  let exp = [null, null];
  t.deepEqual(dbPool._pool, exp, `Pool should be [${exp}]`);

  exp = [DBPool.status.FREE, DBPool.status.FREE];
  t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

  // 2. initialising model

  dbPool.getNextDb((poolErr, db) => {
    exp = 1;
    t.equal(DBStub.prototype.init.callCount, exp, `callCount for DB.init should be ${exp}`);

    t.error(poolErr, 'Do not expect getNextDb error');
    t.ok(db);

    exp = [{name: 'db_0_0'}, null];
    t.equal(dbPool._pool[0].name, exp[0].name, `First db should have the correct name ${exp[0].name}`);
    t.equal(dbPool._pool[1], exp[1], `First db should be ${exp[1]}`);

    exp = [DBPool.status.LOADING, DBPool.status.FREE];
    t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

    // 3. pretend that we finished loading article with the orchestrator full import

    dbPool.swapDb(swapErr => {
      t.error(swapErr, 'Do not expect swap error');

      exp = 1;
      t.equal(DBStub.prototype.init.callCount, exp, `callCount for DB.init should be ${exp}`);

      exp = 0;
      t.equal(destroySpy.callCount, exp, `callCount for DB.destroy should be ${exp}`);

      exp = [{name: 'db_0_0'}, null];
      t.equal(dbPool._pool[0].name, exp[0].name, `First db should have the correct name ${exp[0].name}`);
      t.equal(dbPool._pool[1], exp[1], `Second db should be ${exp[1]}`);

      exp = [DBPool.status.RUNNING, DBPool.status.FREE];
      t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

      // 4. now the update scenario

      dbPool.getNextDb((poolErr1, db1) => {
        exp = 2;
        t.equal(DBStub.prototype.init.callCount, exp, `callCount for DB.init should be ${exp}`);

        t.error(poolErr1, 'Do not expect getNextDb error');
        t.ok(db1);

        exp = [{name: 'db_0_0'}, {name: 'db_1_1'}];
        t.equal(dbPool._pool[0].name, exp[0].name, `First db should have the correct name ${exp[0].name}`);
        t.equal(dbPool._pool[1].name, exp[1].name, `Second db should have the correct name ${exp[1].name}`);

        exp = [DBPool.status.RUNNING, DBPool.status.LOADING];
        t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

        // 5. pretend that we finished loading article with the orchestrator full import

        dbPool.swapDb(swapErr1 => {
          t.error(swapErr1, '--->Do not expect swap error');

          exp = 2;
          t.equal(DBStub.prototype.init.callCount, exp, `callCount for DB.init should be ${exp}`);

          exp = 1;
          t.equal(destroySpy.callCount, exp, `callCount for DB.destroy should be ${exp}`);

          exp = [null, {name: 'db_1_1'}];
          t.equal(dbPool._pool[0], exp[0], `First db should be ${exp[1]}`);
          t.equal(dbPool._pool[1].name, exp[1].name, `Second db should have the correct name ${exp[1].name}`);

          exp = [DBPool.status.FREE, DBPool.status.RUNNING];
          t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

          // 6. and the update scenario again

          dbPool.getNextDb((poolErr2, db2) => {
            exp = 3;
            t.equal(DBStub.prototype.init.callCount, exp, `callCount for DB.init should be ${exp}`);

            t.error(poolErr2, 'Do not expect getNextDb error');
            t.ok(db2);

            exp = [{name: 'db_2_0'}, {name: 'db_1_1'}];
            t.equal(dbPool._pool[0].name, exp[0].name, `First db should have the correct name ${exp[0].name}`);
            t.equal(dbPool._pool[1].name, exp[1].name, `Second db should have the correct name ${exp[1].name}`);

            exp = [DBPool.status.LOADING, DBPool.status.RUNNING];
            t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

            // 7. again, pretend that we finished loading article with the orchestrator full import

            dbPool.swapDb(swapErr2 => {
              t.error(swapErr2, '--->Do not expect swap error');

              exp = 3;
              t.equal(DBStub.prototype.init.callCount, exp, `callCount for DB.init should be ${exp}`);

              exp = 2;
              t.equal(destroySpy.callCount, exp, `callCount for DB.destroy should be ${exp}`);

              exp = [{name: 'db_2_0'}, null];
              t.equal(dbPool._pool[0].name, exp[0].name, `First db should have the correct name ${exp[0].name}`);
              t.equal(dbPool._pool[1], exp[1], `Second db should be ${exp[1]}`);

              exp = [DBPool.status.RUNNING, DBPool.status.FREE];
              t.deepEqual(dbPool._info, exp, `Status should be [${exp}]`);

              t.end();
            });

            // this is for test 7
            exp = [DBPool.status.RUNNING, DBPool.status.DESTROYING];
            t.deepEqual(dbPool._info, exp, `--->Status should be [${exp}]`);

            destroyCb();
          });
        });

        // this is for test 5
        exp = [DBPool.status.DESTROYING, DBPool.status.RUNNING];
        t.deepEqual(dbPool._info, exp, `--->Status should be [${exp}]`);

        destroyCb();
      });
    });
  });
});
