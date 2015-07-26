var Point = require('./point');

function cloneObject(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function Map(x, y, squares, actors, theme) {

    this.res = new Point(x, y);
    this.squares = [];
    this.actors = [];
    this.theme = theme?theme:10;
    this.mapSize = this.res.x * this.res.y;

    for(var i = this.mapSize; i < y; ++i) {
        this.squares.push('o');
    }

    if(typeof squares !== 'undefined') {
        this.setSquares(squares);
    }

    if(typeof actors !== 'undefined') {
        this.actors = actors;
    }else{
        this.actors = [
            {
                type: 'l',
                pos: new Point(0, 0),
                dir: new Point(1, 0)
            }
        ];
    }
}
exports = module.exports = Map;

Map.prototype.setSquares = function setSquares(squares) {

    if(squares.length > 0) {

        // Set from 2D array
        if(squares[0] instanceof Array) {
            for(var i = 0; i < squares.length && i < this.res.y; ++i) {
                for( var j = 0; j < squares[i].length && j < this.res.x; ++j) {
                    this.squares[i * this.res.x + j] = squares[i][j];
                }
            }
        }
        // Set from 1D array
        else {
            for(var i = 0; i < squares.length && i < this.mapSize; ++i) {
                this.squares[i] = squares[i];
            }
        }
    }

};

Map.prototype.set = function set(value, x, y) {

    if(typeof y === 'undefined') {
        y = x.y;
        x = x.x;
    }
    var index = y * this.res.x + x;
    if(index < this.mapSize) {
        this.squares[index] = value;
    }

}

Map.prototype.get = function get(x, y) {

    if(typeof y === 'undefined') {
        y = x.y;
        x = x.x;
    }
    var index = y * this.res.x + x;
    if(index < this.mapSize) {
        return this.squares[index];
    }
    return null;

}

Map.prototype.clone = function clone() {

    var newActors = [];
    var obj, keys;
    for (var i=0; i<this.actors.length; i++){
        newActors[i] = {};
        obj = this.actors[i];
        keys = Object.keys(obj);
        for (var k=0; k<keys.length; k++){
            if (typeof obj[keys[k]] == 'object'){ // Point
                newActors[i][keys[k]] = obj[keys[k]].clone();
            }else{
                newActors[i][keys[k]] = cloneObject(obj[keys[k]]);
            }
        }
    }
    return new Map(this.res.x, this.res.y, this.squares, newActors);

}