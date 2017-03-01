// TODO: deep refactor - move couchdb specific stuff to an abstraction layer

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
// router.get('/', function(req, res, next) {
//   let locals = res.locals;
//   locals.section = 'blog-home';
//   locals.data = locals.data || {};
//   locals.data.posts = [];
//   res.render('index', { title: 'Express' });
// });

// TODO articles should be placed in categories from URL point of view,
// like if a category was a directory of articles

/* GET list of posts per category or tag */
router.get([
    myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.categories, ':category'),
    myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.tags, ':tag'),
    myUtils.generateURL(conf.BLOG_PATHS.blog)
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

    let curPage = req.query.page || 1;

    let skip = (curPage - 1) * conf.ARTICLES_PER_PAGE;

    let queryOptions = {
      skip: skip,
      limit: conf.ARTICLES_PER_PAGE,
      //key: req.params.category,
      descending: true,
      include_docs: true
    };

    let searchKey = req.params.category || req.params.tag
    if (searchKey) {
      queryOptions.endkey = [searchKey];
      queryOptions.startkey = [searchKey, {}];
    }

    let viewType;
    if (req.params.tag) viewType = 'articles/byTag';
    // else if there is a category or category is undefined (meaning all latest articles)
    else viewType = 'articles/byCategory';

    model.db.articles.query(viewType,
      queryOptions, (err, resArticles) => {
      if (err) return next(err);
      let articles = [];
      resArticles.rows.forEach(item => {
        item.doc.publishedDate = moment(item.doc.publishedDate);
        item.doc.image = {exists: false};
        articles.push(item.doc);
        console.log('->', item.doc._id);
      });

      if (req.params.category) console.log(`got all articles for category ${req.params.category}.`);
      else if (req.params.tag) console.log(`got all articles for tag ${req.params.tag}.`);

      // TODO: rename posts to articles
      locals.data.posts.results = articles;

      locals.data.posts.first = (curPage - 1) * conf.ARTICLES_PER_PAGE + 1;
      locals.data.posts.last = locals.data.posts.first + conf.ARTICLES_PER_PAGE;
      locals.data.posts.total = resArticles.total_rows;
      locals.data.posts.totalPages = Math.ceil(resArticles.total_rows/conf.ARTICLES_PER_PAGE);
      locals.data.posts.previous = 2017;
      locals.data.posts.next = 2017;
      locals.data.posts.pages = [2015, 2016, 2017];

      if (req.params.category) {
        model.db.categories.get(req.params.category, (catErr, catDoc) => {
          if (catErr) return next(catErr);
          //console.log('category doc-->', catDoc);
          locals.data.category = catDoc;
          res.render('blog');
        });
      } else if (req.params.tag) {
        model.db.tags.get(req.params.tag, (tagErr, tagDoc) => {
          if (tagErr) return next(tagErr);
          //console.log('tag doc-->', tagDoc);
          locals.data.tag = tagDoc;
          res.render('blog');
        });
      } else {
        // This if display all articles view
        //locals.data.category = {name: 'Latest'};
        res.render('blog');
      }
    });

    // if (0) {
    //   model.db.categories.get(req.params.category, (catErr, catDoc) => {
    //     if (catErr) return next(catErr);
    //     //console.log('category doc-->', catDoc);
    //     locals.data.category = catDoc;
    //     async.eachSeries(
    //       catDoc.articles,
    //       (article, cb) => {
    //         model.db.articles.get(article, (articleErr, articleDoc) => {
    //           if (articleErr) return cb(articleErr);
    //           // TODO create utility to post-process articles before sending them to render
    //           articleDoc.publishedDate = moment(articleDoc.publishedDate);
    //           // TODO add article intro image support
    //           articleDoc.image = {exists: false};
    //           locals.data.posts.results.push(articleDoc);
    //           console.log('->', articleDoc._id);
    //           cb(null);
    //         })
    //       }, err => {
    //         if (err) return next(err);
    //         console.log(`got all articles for category ${req.params.category}.`);
    //         locals.data.posts.results.sort((a, b) => {
    //           if (a.publishedDate < b.publishedDate)
    //             return 1;
    //           if (a.publishedDate > b.publishedDate)
    //             return -1;
    //           return 0;
    //         });
    //         res.render('blog');
    //       });
    //   });
    // }
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

module.exports = router;
