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
const blog = model.blogDB;

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
  ], function nofavicon(req, res, next) {
    if (req.params.category === 'favicon.ico') {
      return res.send(404);
    }
    next();
  }, middleware.initLocals,
  middleware.fetchCategories,
  middleware.fetchTags,
  middleware.fetchLatestPosts,
  middleware.fetchPopularPosts,
  function renderArticleList(req, res, next) {
    let locals = res.locals;
    // TODO: Why do I need that?
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

    let filter = {};
    if (req.params.category) filter.category = req.params.category;
    else if (req.params.tag) filter.tag = req.params.tag;

    let queryOpt = {
      skip: (curPage - 1) * conf.ARTICLES_PER_PAGE,
      limit: conf.ARTICLES_PER_PAGE,
      direction: -1
    };

    blog.count(blog.col.ARTICLES, filter, (countErr, countResponse) => {
      if (countErr) return next(countErr);
      let articleCount = countResponse;

      blog.find(blog.col.ARTICLES, filter, queryOpt, (findErr, findResponse) => {
        if (findErr) return next(findErr);

        // TODO: rename posts to articles
        let articles = locals.data.posts.results = findResponse.map(item => {
          const doc = item.doc;
          doc.publishedDate = moment(item.doc.publishedDate);
          doc.image = {exists: false};
          return doc;
        });

        if (req.params.category) console.log(`got all articles for category ${req.params.category}.`);
        else if (req.params.tag) console.log(`got all articles for tag ${req.params.tag}.`);

        let pagination = {};
        pagination.totalArticles = articleCount;//resArticles.total_rows;
        pagination.totalPages = Math.ceil(pagination.totalArticles/conf.ARTICLES_PER_PAGE);
        pagination.currentPage = parseInt(curPage);
        pagination.previousPage = pagination.currentPage > 1 ? pagination.currentPage - 1 : null;
        pagination.nextPage = pagination.currentPage < pagination.totalPages ? pagination.currentPage + 1 : null;
        pagination.pagesList = Array.from(new Array(pagination.totalPages), (v,i) => i + 1);

        pagination.firstArticleIdxInCurPage = (pagination.currentPage - 1) * conf.ARTICLES_PER_PAGE + 1;
        pagination.lastArticleIdxInCurPage = pagination.firstArticleIdxInCurPage + articles.length - 1;

        console.log('===> pagination', pagination);

        // TODO: update views to use the pagination object
        locals.data.posts.first = pagination.firstArticleIdxInCurPage;
        locals.data.posts.last = pagination.lastArticleIdxInCurPage;
        locals.data.posts.total = pagination.totalArticles;
        locals.data.posts.totalPages = pagination.totalPages;
        locals.data.posts.currentPage = pagination.currentPage;
        locals.data.posts.previous = pagination.previousPage;
        locals.data.posts.next = pagination.nextPage;
        locals.data.posts.pages = pagination.pagesList;

        // get the category details
        if (req.params.category) {
          blog.findOne(blog.col.CATEGORIES, req.params.category, (catErr, catDoc) => {
            debugger;
            if (catErr) return next(catErr);
            //console.log('category doc-->', catDoc);
            locals.data.category = catDoc;
            res.render('blog');
          });
        } else if (req.params.tag) {
          blog.findOne(blog.col.TAGS, req.params.tag, (tagErr, tagDoc) => {
            if (tagErr) return next(tagDoc);
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
    });
  });

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
