/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

const	async = require('async');
const	myUtils = require('../libs/my-utils');
const conf = require('../config');
const model = require('../model');


/**
  Initialises the standard view locals
*/

exports.initLocals = function(req, res, next) {

  var locals = res.locals;

  locals.curYear = new Date().getFullYear().toString();
  locals.title = conf.blogTitle;

  next();
};


// /**
//   Fetches and clears the flashMessages before a view is rendered
// */
//
// exports.flashMessages = function(req, res, next) {
//
//   var flashMessages = {
//     info: req.flash('info'),
//     success: req.flash('success'),
//     warning: req.flash('warning'),
//     error: req.flash('error')
//   };
//
//   res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
//
//   next();
//
// };
//
//
// /**
//   Prevents people from accessing protected pages when they're not signed in
//  */
//
// exports.requireUser = function(req, res, next) {
//
//   if (!req.user) {
//     req.flash('error', 'Please sign in to access this page.');
//     res.redirect('/keystone/signin');
//   } else {
//     next();
//   }
//
// };

exports.fetchCategories = function(req, res, next) {

  var locals = res.locals;
  locals.data = locals.data || {};
  locals.data.categories = [];

  model.db.categories.allDocs({include_docs: true}, (err, catList) => {
    if (err) return next(err);
    catList.rows.forEach((category) => {
      locals.data.categories.push({
        id: category.doc._id,
        articleCount: category.doc.articles.length
      });
    });
    next();
  });
};

exports.fetchTags = function(req, res, next) {

  var locals = res.locals;
  locals.data = locals.data || {};
  locals.data.tags = [];

  model.db.tags.allDocs({include_docs: true}, (err, tagList) => {
    if (err) return next(err);
    tagList.rows.forEach((tag) => {
      locals.data.tags.push({
        id: tag.doc._id,
        articleCount: tag.doc.articles.length
      });
    });
    next();
  });

  // keystone.list('PostTag').model.find().sort('name').exec(function(err, results) {
  //   if (err) {
  //     return next(err);
  //   }
  //
  //   locals.data.tags = results;
  //
  //   // Load the counts for each tag
  //   async.each(locals.data.tags, function(tag, cb) {
  //     keystone.list('Post').model.count().where('tags').in([tag.id]).exec(function(err, count) {
  //       tag.postCount = count;
  //       cb(err);
  //     });
  //   }, function(err) {
  //     next(err);
  //   });
  // });
};

// Load the posts
exports.fetchLatestPosts = function(req, res, next) {
  var locals = res.locals,
    q = keystone.list('Post').model
    .find()
    .where('state', 'published')
    .limit(5)
    .sort('-publishedDate')
    .select('slug title');

  q.exec(function(err, results) {
    locals.data.latestPosts = results;
    next(err);
  });
};

// Load the posts
exports.fetchPopularPosts = function(req, res, next) {
  var locals = res.locals,
    q = keystone.list('Post').model
    .find()
    .where('state', 'published')
    .limit(5)
    .sort('-hits')
    .select('slug title hits');

  q.exec(function(err, results) {
    locals.data.popularPosts = results;
    next(err);
  });
};
