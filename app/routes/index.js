// TODO: deep refactor - move couchdb specific stuff to an abstraction layer

const express = require('express');
const async = require('async');
const moment = require('moment');
const cheerio = require('cheerio');

const middleware = require('./middleware');
const myUtils = require('../libs/my-utils');
const conf = require('../config');

const model = require('../model').model;

function initRouter() {
  console.log('INIT ROUTER');
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

  // article specific statics
  // index:false means the root of the folder will give 404
  // more info: https://evanhahn.com/express-dot-static-deep-dive/
  router.use(express.static(conf.app.paths.staticFilesDir + '_' + model.getName(), {index: false}));

  /* GET list of posts per category or tag */
  router.get([
      myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.categories, ':category'),
      myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.tags, ':tag'),
      myUtils.generateURL(conf.BLOG_PATHS.blog)
    ], function nofavicon(req, res, next) {
      debugger;
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
      const locals = res.locals;

      locals.data = locals.data || {};
      locals.data.articles = [];
      const pagination = locals.data.pagination = {};
      pagination.totalPages = 1;
      pagination.currentPage = parseInt(req.query.page || 1);

      let dbFilter = locals.filters = {};
      if (req.params.category) dbFilter.category = req.params.category;
      else if (req.params.tag) dbFilter.tag = req.params.tag;

      let queryOpt = {
        skip: (pagination.currentPage - 1) * conf.ARTICLES_PER_PAGE,
        limit: conf.ARTICLES_PER_PAGE,
        direction: -1
      };

      model.count(model.col.ARTICLES, dbFilter, (countErr, countResponse) => {
        if (countErr) return next(countErr);

        model.find(model.col.ARTICLES, dbFilter, queryOpt, (findErr, findResponse) => {
          if (findErr) return next(findErr);

          locals.data.articles = findResponse.map(item => {
            item.publishedDate = moment(item.config.publishedDate);
            item.image = {exists: false};
            return item;
          });

          // if (req.params.category) console.log(`got all articles for category ${req.params.category}.`);
          // else if (req.params.tag) console.log(`got all articles for tag ${req.params.tag}.`);

          pagination.totalArticles = countResponse;//resArticles.total_rows;
          pagination.totalPages = Math.ceil(pagination.totalArticles/conf.ARTICLES_PER_PAGE);
          pagination.previousPage = pagination.currentPage > 1 ? pagination.currentPage - 1 : null;
          pagination.nextPage = pagination.currentPage < pagination.totalPages ? pagination.currentPage + 1 : null;
          pagination.pagesList = Array.from(new Array(pagination.totalPages), (v,i) => i + 1);

          pagination.firstArticleIdxInCurPage = (pagination.currentPage - 1) * conf.ARTICLES_PER_PAGE + 1;
          pagination.lastArticleIdxInCurPage = pagination.firstArticleIdxInCurPage + locals.data.articles.length - 1;

          //console.log('===> pagination', pagination);

          // get the category details
          if (req.params.category) {
            model.findOne(model.col.CATEGORIES, req.params.category, (catErr, catDoc) => {
              if (catErr) return next(catErr);
              //console.log('category doc-->', catDoc);
              locals.data.category = catDoc;
              res.render('blog');
            });
          } else if (req.params.tag) {
            model.findOne(model.col.TAGS, req.params.tag, (tagErr, tagDoc) => {
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
    // TODO: Handle favicons correctly
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

      model.findOne(model.col.ARTICLES, req.params.post, (articleErr, article) => {
        if (articleErr) return next(articleErr);

        locals.data.article = article;
        // TODO create utility to post-process articles before sending them to render
        article.publishedDate = moment(article.publishedDate);
        article.image = {exists: false};

        res.render('article', (err, html) => {
          if (err) return next(err);

          // TODO make it a module
          // get markdown tables display nicely with bootstrap
          if (article.extendedType === "md") {
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
  return router;
}

module.exports = initRouter;
