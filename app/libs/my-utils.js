const slug = require('slug');
const inflect = require('i')();

const generateURL = exports.generateURL = function generateURL () {
  var BLOG_PATHS = Array.prototype.slice.call(arguments);
  //console.log('IN--->', BLOG_PATHS);

  //BLOG_PATHS = _.isString(BLOG_PATHS) ? [BLOG_PATHS] : BLOG_PATHS;
  BLOG_PATHS = typeof BLOG_PATHS === String ? [BLOG_PATHS] : BLOG_PATHS;
  //BLOG_PATHS = _.compact(BLOG_PATHS);
  BLOG_PATHS = BLOG_PATHS.filter(i => !!i);

  if (BLOG_PATHS.length === 1 && BLOG_PATHS[0] === '/') return BLOG_PATHS[0];


  var ret = '';
  BLOG_PATHS.forEach(function(url) {
    if (url !== '/') ret += '/' + url;
  });
  //console.log('OUT--->', ret, '\n');
  return ret;
};

// borrowed from https://github.com/keystonejs/keystone-utils/blob/master/lib/index.js
const pluralify = exports.pluralify = function pluralify (count, sn, pl) {
  if (arguments.length === 1) {
    return inflect.pluralize(count);
  }
  if (typeof sn !== 'string') sn = '';
  if (!pl) {
    pl = inflect.pluralize(sn);
  }
  if (typeof count === 'string') {
    count = Number(count);
  } else if (typeof count !== 'number') {
    count = Object.keys(count).length;
  }
  return (count === 1 ? sn : pl).replace('*', count);
};

const slugify = exports.slugify = function slugify (input) {
  return slug(input, {lower: true});
}

const titlefy = exports.titlefy = function titlefy (input) {
  return inflect.titleize(input);
}

const camelizefy = exports.camelizefy = function camelizefy (input) {
  input = input.split(' ').join('_');
  input = input.split('-').join('_');
  return inflect.camelize(input);
}
