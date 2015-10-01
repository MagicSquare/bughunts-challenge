var Point = require('../../lib/point'),
    Game = require('../../lib/Game'),
    Map = require('../../lib/map');


var squares = [
    ['s','s','o','o','s','s'],
    ['s','s','o','o','s','s'],
    ['l','o','o','o','o','g'],
    ['o','o','o','o','o','s'],
    ['o','o','o','o','o','s'],
    ['o','o','o','1','s','s']
];

var actors = [
    {
        type: 'l',
        pos: new Point(0, 2),
        dir: Game.DIR_RIGHT
    },
    {
        type: 'r',
        pos: new Point(3, 5),
        dir: Game.DIR_TOP,
        move: "FO FO FO FO FO"
    }
];

exports.map = new Map(6, 6, squares, actors);
exports.hashTag = '#0x0006';