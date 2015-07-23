var Map = require('../../lib/Map');

var squares = [
    ['l','o','o','o','o'],
    ['o','o','o','o','o'],
    ['o','o','o','g','o'],
    ['o','o','o','o','o'],
    ['o','o','o','o','o']
];

exports.map = new Map(5, 5, squares);
exports.hashTag = '#0x003D';