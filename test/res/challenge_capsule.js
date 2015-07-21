var Point = require('../../lib/point'),
    Game = require('../../lib/Game');

exports.map = [
    ['l','1','o','o','o'],
    ['o','o','o','s','o'],
    ['2','o','3','g','s'],
    ['o','o','o','s','o'],
    ['o','o','o','o','o']
];

exports.hashTag = '#0x003D';

exports.actors = [
    {
        type: 'l',
        pos: new Point(0, 0),
        dir: Game.DIR_RIGHT
    },
    {
        type: 't',
        pos: new Point(1, 0),
        target : 2
    },
    {
        type: 'm',
        pos: new Point(0, 2),
        dir: Game.DIR_RIGHT
    },
    {
        type: 'w',
        pos: new Point(2, 2)
    }
];