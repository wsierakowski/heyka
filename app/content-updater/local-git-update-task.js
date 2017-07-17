const conf = require('../config');
const pullLocally = require('./local-git-pull');
const TaskQueue = require('./task-queue.js');

const taskQueue = new TaskQueue({tasksLimit: 2, replaceLastIfLimitReached: true});

module.exports.beginPull = function taskQueuePull(cb) {
  console.log(new Date(), '------> adding new task to taskqueue');
  taskQueue.push(function newPullLocally() {
    console.log(new Date(), '------> executing new task');
    pullLocally(
      conf.app.paths.localRepoDir,
      conf.REPO_REMOTE_PATH,
      function onNewPullComplete(pullErr) {
        //if (pullErr) return console.log('** New Pull went wrong:', pullErr);
        cb(pullErr);
    });
  });
};

module.exports.finish = function taskQueueShift() {
  taskQueue.shift();
};
