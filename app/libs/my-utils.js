const slug = require('slug');
const inflect = require('i')();

const generateURL = exports.generateURL = function generateURL () {
  var pathPieces = Array.prototype.slice.call(arguments);
  //console.log('IN--->', pathPieces);

  //pathPieces = _.isString(pathPieces) ? [pathPieces] : pathPieces;
  pathPieces = typeof pathPieces === String ? [pathPieces] : pathPieces;
  //pathPieces = _.compact(pathPieces);
  pathPieces = pathPieces.filter(i => !!i);

  if (pathPieces.length === 1 && pathPieces[0] === '/') return pathPieces[0];


  var ret = '';
  pathPieces.forEach(function(url) {
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
