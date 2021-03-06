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

const model = require('../model').model;

/**
  Initialises the standard view locals
*/

exports.initLocals = function(req, res, next) {

  var locals = res.locals;

  locals.curYear = new Date().getFullYear().toString();
  locals.title = conf.BLOG_TITLE;

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

  model.find(model.col.CATEGORIES, (err, catList) => {
    if (err) return next(err);
    catList.forEach((category) => {
      locals.data.categories.push({
        id: category.id,
        name: category.name,
        articleCount: category.articles.length
      });
    });
    next();
  });
};

exports.fetchTags = function(req, res, next) {

  var locals = res.locals;
  locals.data = locals.data || {};
  locals.data.tags = [];

  model.find(model.col.TAGS, (err, tagList) => {
    if (err) return next(err);
    tagList.forEach((tag) => {
      locals.data.tags.push({
        id: tag.id,
        name: tag.name,
        articleCount: tag.articles.length
      });
    });
    next();
  });
};

exports.fetchLatestPosts = function(req, res, next) {
  var locals = res.locals;

  let queryOpt = {
    skip: 0,
    limit: 5,
    direction: -1
  };
  model.find(model.col.ARTICLES, {}, queryOpt, (findErr, findResponse) => {
    if (findErr) return next(findErr);
    locals.data.latestPosts = findResponse.map(article => {
      return {
        id: article._id,
        title: article.config.title,
        category: article.category
      };
    });
    next();
  });

};

// Load the posts
exports.fetchPopularPosts = function(req, res, next) {
  var locals = res.locals;
  // fetch popular posts (where state=published, limit 5, sort -hits)
  locals.data.popularPosts = [{
    id: 'some-random-popular-article-post',
    title: 'some random popular article post',
    category: {id: 'tips'}
  }];
  next();
  // var locals = res.locals,
  //   q = keystone.list('Post').model
  //   .find()
  //   .where('state', 'published')
  //   .limit(5)
  //   .sort('-hits')
  //   .select('slug title hits');
  //
  // q.exec(function(err, results) {
  //   locals.data.popularPosts = results;
  //   next(err);
  // });
};
