'use strict'

/**
 * TasksQueueExecutor works in two modes that behave differently when shifting tasks:
 * 1. Callback Mode: If a callback is passed to the constructor, shifted task
 *    will be passed to that callback. The task itself will not be called and
 *    tasks can be any type of data.
 * 2. Non-Callback Mode: If a callback is not passed to the constructor, shifted
 *    task will be called.
 *
 * Constructor:
 * @param {Object} Options Required.
 * @param {function} callback Optional. Called when new task is ready to be executed.
 */
class TaskQueueExecutor {
  constructor (opts, cb) {
    if (cb && typeof cb !== 'function') {
      throw "When using the Callback Mode, the callback provided to the constructor must be a function.";
    }
    if (!opts.tasksLimit || typeof opts.tasksLimit !== 'number') {
      throw "Tasks limit is required and needs to be over 0.";
    }
    this._cb = cb;
    this._replaceLastIfLimitReached = !!opts.replaceLastIfLimitReached;
    this._tasksLimit = opts.tasksLimit;
    this._tasks = [];
  }

  push(task) {
    console.log(`TasksQueue: Received new task, queue status before push: ${this._tasks.length}/${this._tasksLimit}.`);
    if (this._tasks.length < this._tasksLimit) {
      if (!this._cb && typeof task !== 'function') {
        throw "When using Non-Callback mode, each task must be a function.";
      }
      this._tasks.push(task);
      if (this._tasks.length === 1) {
        this._executeTask();
      }
    } else {
      if (this._replaceLastIfLimitReached) {
        this._tasks[this._tasks.length - 1] = task;
      } else {
        throw `Reached the limit of ${this._tasksLimit} tasks.`;
      }
    }
  }

  shift() {
    console.log(`TasksQueue: Shifting task, queue status: ${this._tasks.length}/${this._tasksLimit}.`);
    let shiftedItem = this._tasks.shift();
    if (this._tasks.length > 0) {
      this._executeTask();
    }
  }

  _executeTask() {
    if (this._cb) {
      this._cb(this._tasks[0]);
    } else {
      this._tasks[0]();
    }
  }

  get currentItem() {
    return this._tasks[0];
  }
}

module.exports = TaskQueueExecutor;
