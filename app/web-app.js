const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');

const model = require('./model');

const myUtils = require('./libs/my-utils.js');
const conf = require('./config');

const app = express();


var initialised = false;

function init() {
  console.log('WEB APP INIT');
  var mainRouter = index();
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  // blog specific statics
  app.use(express.static(path.join(__dirname, 'public')));
  // article specific statics
  //https://github.com/expressjs/express/issues/2596
  //app.use(express.static(conf.app.paths.staticFilesDir, {index: false}));

  app.get('/update', (req, res, next) => {
    // TODO - make sure this isn't run before model is ready...
    res.status(200).send('thanks for update notification');
    model.update(err => {
      if (err) {
        console.log(' **** MODEL UPDATE FAILED **** ');
        console.log(err);
        console.log(' ************************* ');
        return;
      }
      initNav(err => {
        mainRouter = index();
        console.log(' **** BLOG RUNNING ON UPDATED CONTENT **** ');
      });
    });
  });

  //app.use('/', index());
  app.use('/', function (req, res, next) {
    // this needs to be a function to hook on whatever the current router is
    mainRouter(req, res, next);
  });
  //app.use('/users', users);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.locals.myUtils = myUtils;

  app.locals.BLOG_PATHS = conf.BLOG_PATHS;

  initialised = true;

  return app;
}

/**
The included layout depends on the navLinks array to generate
the navigation in the header, you may wish to change this array
or replace it with your own templates / logic.
*/
function initNav(cb) {
  if (!initialised) return cb({where: 'initNav', msg: 'WebApp not initialised yet.'});
  app.locals.navLinks = [];
  app.locals.navLinks.push({
    label: 'Latests', key: 'latests', href: myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.categories)
  });
  model.find(model.col.CATEGORIES, (err, res) => {
    if (err) return cb({where: 'initNav', err: err});
    //app.locals.navLinks.push({label: 'MenuItem1', key: 'menuitem1', href:'http://sigman.pl'});
    res.forEach(doc => {
      let cat = doc.doc;
      //console.log('cat:', {label: cat.name, key: cat.id, href: cat.id});
      app.locals.navLinks.push({
        label: cat.name,
        key: cat.id,
        href: myUtils.generateURL(conf.BLOG_PATHS.blog, conf.BLOG_PATHS.categories, cat.id)
      });
    });
    cb(null);
  });
}

module.exports = {
  init: init,
  initNav: initNav
};
