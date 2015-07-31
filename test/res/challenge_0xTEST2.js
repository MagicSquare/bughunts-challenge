var Map = require('../../lib/map');

var squares = [
    [ 'l', 'o', 'o', 's', 'o', 'o', 'o' ],
    [ 's', 's', 'o', 'o', 'o', 'o', 'o' ],
    [ 'o', 'o', 'o', 'o', 's', 's', 'o' ],
    [ 'o', 's', 's', 'o', 'o', 'o', 'o' ],
    [ 'o', 'g', 'o', 'o', 'o', 'o', 'o' ],
    [ 'o', 's', 'o', 'o', 'o', 'o', 'o' ]
];

exports.map = new Map(7, 6, squares);
exports.hashTag = '#0xTEST2';