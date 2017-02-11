var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var myUtils = require('./libs/my-utils.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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

app.locals.title = "heyka.com blog";
app.locals.curYear = new Date().getFullYear().toString();
app.locals.navLinks = [];
app.locals.navLinks.push({label: 'Grzyb1', key: 'grzyb1', href:'http://sigman.pl'});
app.locals.navLinks.push({label: 'Grzyb2', key: 'grzyb2', href:'http://sigman.pl'});
app.locals.navLinks.push({label: 'Grzyb3', key: 'grzyb3', href:'http://sigman.pl'});

app.locals.myUtils = myUtils;

app.locals.urls = {
    blog: '/',
    categories: '',
    posts: 'posts',
    tags: 'tags'
};

module.exports = app;
