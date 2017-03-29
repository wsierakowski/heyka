const rules = [
  {name: 'author.name', type: 'string', required: true},
  {name: 'category', type: 'string', required: true},
  {name: 'content.brief', type: 'string', required: true},
//      {name: 'content.briefType', type: 'string'},
  {name: 'content.extended', type: 'string', required: true},
  {name: 'content.extendedType', type: 'string', required: true},
  {name: 'publishedDate', type: 'string', required: true},
  {name: 'state', type: 'string', required: true},
  {name: 'tags', type: 'arrayOfStrings', required: true},
  {name: 'title', type: 'string', required: true},
  {name: 'published', type: 'boolean', required: false}
];

const validators = {
  'string': function(v) {return typeof v === 'string';},
  'boolean': function(v) {return typeof v === 'boolean';},
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
    if (!rule.required && conf[splitName[0]] === undefined) return;
    if (conf[splitName[0]] === undefined) {
      res.push(`1. ${splitName[0]} is not a(n) ${rule.type}.`);
    }
    // we know this is always two level depth so we are simplifying this...
    else if (splitName.length < 2) {
      if (!validators[rule.type](conf[rule.name])) {
        res.push(`2. ${rule.name} is not a(n) ${rule.type}.`);
      }
    } else {
      if (!validators.object(conf[splitName[0]])) {
        res.push(`3. ${splitName[0]} is not a(n) object.`);
      } else {
        if (!rule.required && conf[splitName[0]][splitName[1]] === undefined) return;
        if (!validators[rule.type](conf[splitName[0]][splitName[1]])) {
          res.push(`4. ${rule.name} is not a(n) ${rule.type}.`);
        }
      }
    }
  });
  return res;
}

module.exports = validateConfObj;
