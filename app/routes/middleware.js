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


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {

	var locals = res.locals;

	locals.curYear = new Date().getFullYear().toString();
	locals.title = keystone.get('name');

	var urls = keystone.get('locals').urls;
	locals.navLinks = [];
	locals.navLinks.push({
		label: 'Latests', key: 'latests', href: myUtils.getUrl(urls.blog, urls.categories)
	});

//---------------------------------------------------------------------//////////////////
	keystone.list('PostCategory').model.find().sort('name').exec(function(err, categories) {
		if (err) {
			return next(err);
		}

		_.each(categories, function(cat) {
			locals.navLinks.push({
				label: cat.name,
				key: cat.key,
				href: myUtils.getUrl(urls.blog, urls.categories, cat.key)
			});
		});

		// locals.navLinks.push({ label: 'About',    key: 'about',   href: myUtils.getUrl(urls.blog, 'about') });

		locals.user = req.user;
		next();

	});
//---------------------------------------------------------------------//////////////////
		//{ label: 'Home',    key: 'home',    href: '/' },
		//{ label: 'Blog',    key: 'blog',    href: '/blog' },

		//{ label: 'Contact',   key: 'contact',   href: '/contact' }



};


/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {

	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};

	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;

	next();

};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {

	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}

};

exports.fetchCategories = function(req, res, next) {

	var locals = res.locals;
	locals.data = locals.data || {};
	locals.data.categories = [];

	keystone.list('PostCategory').model.find().sort('name').exec(function(err, results) {
		if (err) {
			return next(err);
		}

		locals.data.categories = results;

		// Load the counts for each category
		async.each(locals.data.categories, function(category, cb) {
			keystone.list('Post').model.count().where('categories').in([category.id]).exec(function(err, count) {
				category.postCount = count;
				cb(err);
			});
		}, function(err) {
			next(err);
		});
	});
};

exports.fetchTags = function(req, res, next) {

	var locals = res.locals;
	locals.data = locals.data || {};
	locals.data.tags = [];

	keystone.list('PostTag').model.find().sort('name').exec(function(err, results) {
		if (err) {
			return next(err);
		}

		locals.data.tags = results;

		// Load the counts for each tag
		async.each(locals.data.tags, function(tag, cb) {
			keystone.list('Post').model.count().where('tags').in([tag.id]).exec(function(err, count) {
				tag.postCount = count;
				cb(err);
			});
		}, function(err) {
			next(err);
		});
	});
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
