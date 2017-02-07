var express = require('express');
var router = express.Router();

var model = require('../model');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.locals.grzyb = 'all categories';
  res.render('index', { title: 'Express' });
});

router.get('/:post', function(req, res, next) {

  // fetch categories
  res.locals.data = res.locals.data || {};

  res.locals.data.categories = [];
  res.locals.data.categories.push({id: 123, key: 'oneTwoThree_key', name: 'oneTwoThree', postCount: 123});
  res.locals.data.categories.push({id: 456, key: 'fourFiveSix_key', name: 'fourFiveSix', postCount: 456});

  // fetch tags
  res.locals.data.tags = [];
  res.locals.data.tags.push({key: 'tag1_key', name: 'tag1', postCount: 10});
  res.locals.data.tags.push({key: 'tag2_key', name: 'tag2', postCount: 20});

  // fetch latest posts (where state=published, limit 5, sort -publishDate)
  res.locals.data.latestPosts = [{
    slug: 'some-random-latest-article-post', title: 'some random latest article post'
  }];

  // fetch popular posts (where state=published, limit 5, sort -hits)
  res.locals.data.popularPosts = [{
    slug: 'some-random-popular-article-post',
    title: 'some random popular article post'
  }];

  // general
  res.locals.data.post = model.articles[0];
  //res.locals.data.category.id = 123;
  res.locals.filters  = req.params.post;

  // why do we need this:
  res.locals.section = 'blog - why do i need this?';

  //res.render('post');
  res.render('article');
});

// router.get('/:category', function(req, res, next) {
//   res.locals.grzyb = req.params.category;
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
