var LadyBug = require('bughunts-lang').LadyBug,
    Point = require('./point');

var OBSTACLE_EXCEPTION = {type: 'obstacle', msg: "Encountered an obstacle"},
    OUTSIDE_MAP_EXCEPTION = {type: 'ouside', msg: "Outside of the map"};

var DIR_TOP = new Point(0, -1),
    DIR_RIGHT = new Point(1, 0),
    DIR_BOTTOM = new Point(0, 1),
    DIR_LEFT = new Point(-1, 0);

var isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function Game(hashTag, mapGame, actors) {
    this.DIR_TOP = DIR_TOP;
    this.DIR_RIGHT = DIR_RIGHT;
    this.DIR_BOTTOM = DIR_BOTTOM;
    this.DIR_LEFT = DIR_LEFT;

    this.INSTRUCTION_FORWARD = 'FO';
    this.INSTRUCTION_BACKWARD = 'BA';
    this.INSTRUCTION_LEFT = 'LE';
    this.INSTRUCTION_RIGHT = 'RI';

    this.GOAL = 'g';
    this.EMPTY = 'o';
    this.STONE = 's';
    this.WEB = 'w';
    this.TRIGGER = 't';
    this.MISSILE = 'm';

    this.hashTag = hashTag;
    this.map = mapGame;
    this.finalIntructions = [];
    this.nbInstructions = 0;
    this.nbSquares = 0;

    this.bug = {
        pos: new Point(0, 0),
        dir: this.DIR_RIGHT.clone()
    };

    this.actors = actors;
}
exports = module.exports = Game;
exports.DIR_TOP = DIR_TOP;
exports.DIR_RIGHT = DIR_RIGHT;
exports.DIR_BOTTOM = DIR_BOTTOM;
exports.DIR_LEFT = DIR_LEFT;

Game.prototype.initBug = function () {
    this.bug = {
        pos: new Point(0, 0),
        dir: this.DIR_RIGHT.clone()
    };
    this.nbInstructions = 0;
    this.nbSquares = 0;
    this.finalIntructions = [];
};

Game.prototype.shootMissile = function(actor){
    var range = 2;
    var pos = actor.pos.clone(),
        dir = actor.dir.mulN(1);

    for (var i = 0; i < range; i++) {

        // Move the missile
        pos.add(dir);
        // Check if it shall destroy
        if (isNumeric(this.map[pos.y][pos.x]) && this.actors[this.map[pos.y][pos.x]].type == this.WEB) {
            this.map[pos.y][pos.x] = this.EMPTY;
            break;
        }
    }
};

Game.prototype.activateActor = function(id){
    var actor = this.actors[id];
    switch (actor.type){
        case this.MISSILE:
            this.shootMissile(actor);
    };
};

Game.prototype.walkOnActor = function(id){
    var actor = this.actors[id];
    switch (actor.type){
        case this.WEB:
            throw OBSTACLE_EXCEPTION;break;
        case this.MISSILE:
            throw OBSTACLE_EXCEPTION;break;
        case this.TRIGGER:
            this.activateActor(actor.target);
    }
};

Game.prototype.pointIsOnMap = function (point) {
    return(
        point.y >= 0 && point.y < this.map.length &&
            point.x >= 0 && point.x < this.map[0].length
        );
};

Game.prototype.moveBugForward = function (nbMove) {
    var multiplier = nbMove / Math.abs(nbMove), // 1 if forward, -1 if backward
        pos = this.bug.pos.clone(),
        dir = this.bug.dir.mulN(multiplier), // Invert the direction if backward
        instruction = multiplier > 0 ? this.INSTRUCTION_FORWARD : this.INSTRUCTION_BACKWARD;

    for (var i = 0; i < Math.abs(nbMove); i++) {

        // Move the bug
        pos.add(dir);

        // Check if the point is on the map and is available
        if (!this.pointIsOnMap(pos)) {
            throw OUTSIDE_MAP_EXCEPTION;
        }
        if (this.map[pos.y][pos.x] == this.STONE) {
            throw OBSTACLE_EXCEPTION;
        }
        if (isNumeric(this.map[pos.y][pos.x])) {
            this.walkOnActor(this.map[pos.y][pos.x]);
        }

        this.finalIntructions.push(instruction);
        this.nbSquares++;
        this.bug.pos.set(pos);

    }
};

Game.prototype.moveBugBackward = function (nbMove) {
    this.moveBugForward(-nbMove);
};

Game.prototype.turnBugLeft = function (nbMove) {
    for (var i = 0; i < nbMove; i++) {
        this.bug.dir.invert().mul(1, -1); // Equivalent to the 2*2 rotation matrix
        this.finalIntructions.push(this.INSTRUCTION_LEFT);
    }
};

Game.prototype.turnBugRight = function (nbMove) {
    for (var i = 0; i < nbMove; i++) {
        this.bug.dir.invert().mul(-1, 1); // Equivalent to the 2*2 rotation matrix
        this.finalIntructions.push(this.INSTRUCTION_RIGHT);
    }
};

Game.prototype.tryChallenge = function (command) {
    this.initBug();
    var self = this,
        isOutsideMap = false,
        score = 0,
        state = {type: 'empty'};

    var parser = new LadyBug({
        onMoveForward:  function(times) {self.moveBugForward(times);},
        onMoveBackward: function(times) {self.moveBugBackward(times);},
        onTurnLeft:     function(times) {self.turnBugLeft(times);},
        onTurnRight:    function(times) {self.turnBugRight(times);},
        onIncrementInstructionCounter: function(times) { self.nbInstructions += times || 1;}
    });

    try{
        parser.run(command.toUpperCase());
    }catch(exception){
        isOutsideMap = exception.type === 'outside';
        state = exception;
        console.log(state);
    }

    var win = !isOutsideMap && (this.map[this.bug.pos.y][this.bug.pos.x]) == this.GOAL;
    if (win) {
        score = this.nbInstructions + this.nbSquares;
        state = {type: 'success'};
    }

    return {
        win: win,
        score: score.toFixed(2),
        instructions: this.finalIntructions.slice(),
        nbInstructions: this.nbInstructions,
        nbSquares: this.nbSquares,
        state: state
    };
};