var Map = require('../../lib/map');

var squares = [
    ['l','o','o','o','o'],
    ['o','o','s','o','o'],
    ['o','s','g','s','o'],
    ['o','o','s','o','o'],
    ['o','o','o','o','o']
];

exports.map = new Map(5, 5, squares);
exports.hashTag = '#0x003D';