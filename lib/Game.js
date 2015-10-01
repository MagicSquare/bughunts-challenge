var LadyBug = require('bughunts-lang').LadyBug,
    Robot = require('bughunts-lang').Robot,
    Point = require('./point');

var OBSTACLE_EXCEPTION = {type: 'obstacle', msg: "Encountered an obstacle"},
    OUTSIDE_MAP_EXCEPTION = {type: 'outside', msg: "Outside of the map"},
    ROBOT_COLLISION_EXCEPTION = {type: 'collision', msg: "Collision with a robot"};

var DIR_TOP = new Point(0, -1),
    DIR_RIGHT = new Point(1, 0),
    DIR_BOTTOM = new Point(0, 1),
    DIR_LEFT = new Point(-1, 0);

var isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function Game(hashTag, map) {
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
    this.LADYBUG = 'l';
    this.ROBOT = 'r';

    this.hashTag = hashTag;

    this.initialMap = map.clone();

    this.restart();
}

exports = module.exports = Game;
exports.DIR_TOP = DIR_TOP;
exports.DIR_RIGHT = DIR_RIGHT;
exports.DIR_BOTTOM = DIR_BOTTOM;
exports.DIR_LEFT = DIR_LEFT;

Game.prototype.restart = function () {

    this.map = this.initialMap.clone();
    this.bug = null;
    this.robot = null;
    for(var i = 0; i<this.map.actors.length; i++){
        if (this.map.actors[i].type == this.LADYBUG){
            this.bug = this.map.actors[i];
        }
        if (this.map.actors[i].type == this.ROBOT){
            this.robot = this.map.actors[i];
        }
    }
    this.nbInstructions = 0;
    this.nbSquares = 0;
    this.finalIntructions = [];
    this.tic = 0;
    this.details = [];
};

Game.prototype.shootMissile = function (actor){
    var range = 2;
    var pos = actor.pos.clone(),
        dir = actor.dir.mulN(1);

    this.pushDetailMissile(pos, dir.mulN(range).add(pos));

    for (var i = 0; i < range; i++) {

        // Move the missile
        pos.add(dir);
        // Check if it shall destroy
        if (isNumeric(this.map.get(pos)) && this.map.actors[this.map.get(pos)].type == this.WEB) {
            this.map.set(this.EMPTY, pos);
            this.pushDetailDestroy(pos);
            break;
        }
    }
};

Game.prototype.activateActor = function (id){
    var actor = this.map.actors[id];
    switch (actor.type){
        case this.MISSILE:
            this.shootMissile(actor);
    };
};

Game.prototype.walkOnActor = function (id){
    var actor = this.map.actors[id];
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
        point.y >= 0 && point.y < this.map.res.y &&
            point.x >= 0 && point.x < this.map.res.x
        );
};

Game.prototype.collideWithRobot = function (pos){
    var detail = this.getDetail(this.tic);
    for (var i=0; i<detail.length; i++){
        if (detail[i].type = 'robot'){
            if (detail[i].robot.pos.x == pos.x && detail[i].robot.pos.y == pos.y){
                return true;
            }
        }
        return false;
    }
}

Game.prototype.getDetail = function (tic) {

    while(this.details.length <= tic) {
        this.details.push([]);
    }
    return this.details[tic];

};

Game.prototype.clearDetailsAfter = function (tic){
    while(this.details.length > tic) {
        this.details.pop();
    }
}

Game.prototype.pushDetailBug = function (location) {

    var detail = this.getDetail(this.tic);

    // Each tic of the clock, we save the position and the direction of the bug in order to redraw the path
    detail.push({
        type: 'bug',
        bug: {
            pos: this.bug.pos.toBasic(),
            dir: this.bug.dir.toBasic()
        }
    });

    // Highlight the current tomette
    detail.push({
        type: 'instruction',
        location: location
    });
};

Game.prototype.pushDetailRobot = function (location) {

    var detail = this.getDetail(this.tic);

    // Each tic of the clock, we save the position and the direction of the robot in order to redraw the path
    detail.push({
        type: 'robot',
        robot: {
            pos: this.robot.pos.toBasic(),
            dir: this.robot.dir.toBasic()
        }
    });

    // Highlight the current tomette
    detail.push({
        type: 'instruction',
        location: location
    });
};

Game.prototype.pushDetailDestroy = function (pos) {

    var detail = this.getDetail(this.tic + 2);
    detail.push({
        type: 'del',
        pos: pos.toBasic()
    });
};

Game.prototype.pushDetailMissile = function (from, to) {

    var detail = this.getDetail(this.tic+1);

    detail.push({
        type: 'object',
        name: 'missile',
        posFrom: from.toBasic(),
        posTo: to.toBasic(),
        duration: 1
    });

};


Game.prototype.moveBugForward = function (nbMove, location) {
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

        var square = this.map.get(pos);
        if (square == this.STONE) {
            throw OBSTACLE_EXCEPTION;
        }
        if (isNumeric(square)) {
            this.walkOnActor(square);
        }

        if (this.robot != null && this.collideWithRobot(pos)){
            throw ROBOT_COLLISION_EXCEPTION;
        }
        this.bug.pos.set(pos);
        this.nbSquares++;
        this.finalIntructions.push(instruction);
        this.pushDetailBug(location);
        this.tic++;
    }
};

Game.prototype.moveBugBackward = function (nbMove, location) {
    this.moveBugForward(-nbMove, location);
};

Game.prototype.turnBugLeft = function (nbMove, location) {
    for (var i = 0; i < nbMove; i++) {
        this.bug.dir.invert().mul(1, -1); // Equivalent to the 2*2 rotation matrix

        this.finalIntructions.push(this.INSTRUCTION_LEFT);
        this.pushDetailBug(location);
        this.tic++;
    }
};

Game.prototype.turnBugRight = function (nbMove, location) {
    for (var i = 0; i < nbMove; i++) {
        this.bug.dir.invert().mul(-1, 1); // Equivalent to the 2*2 rotation matrix
        this.finalIntructions.push(this.INSTRUCTION_RIGHT);
        this.pushDetailBug(location);
        this.tic++;
    }
};

Game.prototype.moveRobotForward = function (nbMove, location) {
    var multiplier = nbMove / Math.abs(nbMove), // 1 if forward, -1 if backward
        pos = this.robot.pos.clone(),
        dir = this.robot.dir.mulN(multiplier), // Invert the direction if backward
        instruction = multiplier > 0 ? this.INSTRUCTION_FORWARD : this.INSTRUCTION_BACKWARD;

    for (var i = 0; i < Math.abs(nbMove); i++) {

        // Move the bug
        pos.add(dir);

        // Check if the point is on the map and is available
        if (!this.pointIsOnMap(pos)) {
            throw OUTSIDE_MAP_EXCEPTION;
        }
        var square = this.map.get(pos);
        if (square == this.STONE) {
            throw OBSTACLE_EXCEPTION;
        }
        if (isNumeric(square)) {
            this.walkOnActor(square);
        }

        this.robot.pos.set(pos);

        this.pushDetailRobot(location);
        this.tic++;
    }
};

Game.prototype.moveRobotBackward = function (nbMove, location) {
    this.moveRobotForward(-nbMove, location);
};

Game.prototype.turnRobotLeft = function (nbMove, location) {
    for (var i = 0; i < nbMove; i++) {
        this.robot.dir.invert().mul(1, -1); // Equivalent to the 2*2 rotation matrix

        this.pushDetailRobot(location);
        this.tic++;
    }
};

Game.prototype.turnRobotRight = function (nbMove, location) {
    for (var i = 0; i < nbMove; i++) {
        this.robot.dir.invert().mul(-1, 1); // Equivalent to the 2*2 rotation matrix
        this.pushDetailRobot(location);
        this.tic++;
    }
};


Game.prototype.tryChallenge = function (command) {
    this.restart();
    var self = this,
        score = 0,
        state = {type: 'empty'};

    if (this.robot != null){
        var parserRobot = new LadyBug({
            onMoveForward:  function(times, location) {self.moveRobotForward(times, location);},
            onMoveBackward: function(times, location) {self.moveRobotBackward(times, location);},
            onTurnLeft:     function(times, location) {self.turnRobotLeft(times, location);},
            onTurnRight:    function(times, location) {self.turnRobotRight(times, location);},
            onIncrementInstructionCounter: function(times) {}
        });

        try{
            parserRobot.run(this.robot.move.toUpperCase());
        }catch(exception){}
        this.tic = 0;
    }

    var parserLadyBug = new LadyBug({
        onMoveForward:  function(times, location) {self.moveBugForward(times, location);},
        onMoveBackward: function(times, location) {self.moveBugBackward(times, location);},
        onTurnLeft:     function(times, location) {self.turnBugLeft(times, location);},
        onTurnRight:    function(times, location) {self.turnBugRight(times, location);},
        onIncrementInstructionCounter: function(times) { self.nbInstructions += times || 1;}
    });

    try{
        parserLadyBug.run(command.toUpperCase());
    }catch(exception){
        console.log(exception);
        state = exception;
    }

    var win = !(state.type === 'outside') && this.map.get(this.bug.pos) == this.GOAL;
    if (win) {
        score = this.nbInstructions + this.nbSquares;
        state = {type: 'success'};
    }

    return {
        win: win,
        score: score,
        instructions: this.finalIntructions.slice(),
        nbInstructions: this.nbInstructions,
        nbSquares: this.nbSquares,
        state: state,
        details: this.details
    };
};