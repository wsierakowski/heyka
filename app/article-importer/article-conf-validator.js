const rules = [
  {name: 'author.name', type: 'string'},
  {name: 'category', type: 'string'},
  {name: 'content.brief', type: 'string'},
//      {name: 'content.briefType', type: 'string'},
  {name: 'content.extended', type: 'string'},
  {name: 'content.extendedType', type: 'string'},
  {name: 'publishedDate', type: 'string'},
  {name: 'state', type: 'string'},
  {name: 'tags', type: 'arrayOfStrings'},
  {name: 'title', type: 'string'}
];

const validators = {
  'string': function(v) {return typeof v === 'string';},
  'object': function(v) {return typeof v === 'object' && !Array.isArray(v)},
  'array': function(v) {return Array.isArray(v)},
  'arrayOfStrings': function(v) {return this.array(v) && v.every(i => this.string(i));}
};

function validateConfObj(conf) {
  if (!conf || typeof conf !== 'object') {
    return ['Configuration object not an object.'];
  }

  let res = [];
  rules.forEach(rule => {
    let splitName = rule.name.split('.');
    if (conf[splitName[0]] === undefined) {
      res.push(`${splitName[0]} is not a(n) ${rule.type}.`);
    }
    // we know this is always two level depth so we are simplifying this...
    else if (splitName.length < 2) {
      if (!validators[rule.type](conf[rule.name])) {
        res.push(`${rule.name} is not a(n) ${rule.type}.`);
      }
    } else {
      if (!validators.object(conf[splitName[0]])) {
        res.push(`${splitName[0]} is not a(n) object.`);
      } else {
        if (!validators[rule.type](conf[splitName[0]][splitName[1]])) {
          res.push(`${rule.name} is not a(n) ${rule.type}.`);
        }
      }
    }
  });
  return res;
}

module.exports = validateConfObj;
