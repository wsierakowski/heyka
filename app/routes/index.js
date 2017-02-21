const express = require('express');
const async = require('async');
const moment = require('moment');
const cheerio = require('cheerio');

const model = require('../model');
const middleware = require('./middleware');
const myUtils = require('../libs/my-utils');
const conf = require('../config');

const router = express.Router();

/*
app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})
*/

/* GET home page. */
router.get('/', function(req, res, next) {
  let locals = res.locals;
  locals.section = 'blog-home';
  locals.data = locals.data || {};
  locals.data.posts = [];
  res.render('index', { title: 'Express' });
});

// TODO articles should be placed in categories from URL point of view,
// like if a category was a directory of articles

/* GET article */
router.get(
  myUtils.generateURL(conf.BLOG_PATHS.blog, ':category', ':post'),
  function(req, res, next) {
    if (req.params.category === 'favicon.ico') {
      return res.send(404);
    }
    next();
  },
  middleware.initLocals,
  middleware.fetchCategories,
  middleware.fetchTags,
  middleware.fetchLatestPosts,
  middleware.fetchPopularPosts,
  function renderSelectedArticle(req, res, next) {
    let locals = res.locals;
    locals.section = 'article';
    locals.filters = {
      post: req.params.post
    };
    locals.data = locals.data || {};
    locals.data.posts = [];

    model.db.articles.get(req.params.post, (err, articleDoc) => {
      if (err) return next(err);
      // TODO create utility to post-process articles before sending them to render
      articleDoc.publishedDate = moment(articleDoc.publishedDate);
      articleDoc.image = {exists: false};
      locals.data.post = articleDoc;
      res.render('article', (rerr, html) => {
        if (rerr) return next(rerr);
        // TODO make it a module
        if (articleDoc.content.extendedType === "md") {
          const $ = cheerio.load(html);
          if (!$('table').attr('class')) {
            $('table').addClass('table table-condensed');
          }
          return res.send($.html());
        }
        return res.send(html);
      });
    });
  }
);

/* GET list of posts per category or tag */
router.get([
    myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.categories, ':category'),
    myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.tags, ':tag'),
  ],
  function(req, res, next) {
    if (req.params.category === 'favicon.ico') {
      return res.send(404);
    }
    next();
  },
  middleware.initLocals,
  middleware.fetchCategories,
  middleware.fetchTags,
  middleware.fetchLatestPosts,
  middleware.fetchPopularPosts,
  function renderArticleList(req, res, next) {
    let locals = res.locals;
    locals.section = 'list';
    locals.filters = {
      category: req.params.category,
      tag: req.params.tag,
      search: req.query.search
    };
    console.log('filters:', locals.filters);
    locals.data = locals.data || {};
    locals.data.posts = {};
    locals.data.posts.results = [];
    locals.data.posts.totalPages = 1;

    model.db.categories.get(req.params.category, (catErr, catDoc) => {
      if (catErr) return next(catErr);
      //console.log('category doc-->', catDoc);
      locals.data.category = catDoc;
      async.eachSeries(
        catDoc.articles,
        (article, cb) => {
          model.db.articles.get(article, (articleErr, articleDoc) => {
            if (articleErr) return cb(articleErr);
            // TODO create utility to post-process articles before sending them to render
            articleDoc.publishedDate = moment(articleDoc.publishedDate);
            // TODO add article intro image support
            articleDoc.image = {exists: false};
            locals.data.posts.results.push(articleDoc);
            console.log('->', articleDoc._id);
            cb(null);
          })
        }, err => {
          if (err) return next(err);
          console.log(`got all articles for category ${req.params.category}.`)
          res.render('blog');
        });
    });
});

// router.get('/:post', function(req, res, next) {
//
//   // fetch categories
//   res.locals.data = res.locals.data || {};
//
//   res.locals.data.categories = [];
//   res.locals.data.categories.push({id: 123, key: 'oneTwoThree_key', name: 'oneTwoThree', postCount: 123});
//   res.locals.data.categories.push({id: 456, key: 'fourFiveSix_key', name: 'fourFiveSix', postCount: 456});
//
//   // fetch tags
//   res.locals.data.tags = [];
//   res.locals.data.tags.push({key: 'tag1_key', name: 'tag1', postCount: 10});
//   res.locals.data.tags.push({key: 'tag2_key', name: 'tag2', postCount: 20});
//
//   // fetch latest posts (where state=published, limit 5, sort -publishDate)
//   res.locals.data.latestPosts = [{
//     slug: 'some-random-latest-article-post', title: 'some random latest article post'
//   }];
//
//   // fetch popular posts (where state=published, limit 5, sort -hits)
//   res.locals.data.popularPosts = [{
//     slug: 'some-random-popular-article-post',
//     title: 'some random popular article post'
//   }];
//
//   // general
//   res.locals.data.post = model.articles[0];
//   //res.locals.data.category.id = 123;
//   res.locals.filters  = req.params.post;
//
//   // why do we need this:
//   res.locals.section = 'blog - why do i need this?';
//
//   //res.render('post');
//   res.render('article');
// });

// router.get('/:category', function(req, res, next) {
//   res.locals.grzyb = req.params.category;
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
