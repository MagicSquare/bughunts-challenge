'use strict';

var should = require('should'),
    Game = require('../lib/Game'),
    challengeTestData = require('./res/challenge_test'),
    challengeStoneData = require('./res/challenge_stone'),
    challenge0XTEST2Data = require('./res/challenge_0xTEST2'),
    challengeCapsuleData = require('./res/challenge_capsule');

var map = null;
var bug = null;
var challenge = new Game(challengeTestData.hashTag, challengeTestData.map),
    challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map),
    challenge0xTEST2 = new Game(challenge0XTEST2Data.hashTag, challenge0XTEST2Data.map),
    challengeCapsule = new Game(challengeCapsuleData.hashTag, challengeCapsuleData.map, challengeCapsuleData.actors);

describe('challenge', function () {
    describe('moveBug', function () {
        beforeEach(function(done) {
            challenge.restart();
            challengeStone.restart();
            challenge0xTEST2.restart();
            challengeCapsule.restart();
            done();
        });

        it('should be able to make the bug move forward', function (done) {
            challenge.moveBugForward(1);
            challenge.bug.pos.x.should.be.equal(1);

            challenge.bug.dir.set(challenge.DIR_BOTTOM);
            challenge.moveBugForward(1);
            challenge.bug.pos.y.should.be.equal(1);

            challenge.bug.dir.set(challenge.DIR_LEFT);
            challenge.moveBugForward(1);
            challenge.bug.pos.x.should.be.equal(0);

            challenge.bug.dir.set(challenge.DIR_TOP);
            challenge.moveBugForward(1);
            challenge.bug.pos.y.should.be.equal(0);

            done();
        });

        it('should make the bug move forward several times', function (done) {
            challenge.moveBugForward(3);
            challenge.bug.pos.x.should.be.equal(3);
            done();
        });

        it('should be able to make the bug move backward', function (done) {
            challenge.bug.dir.set(challenge.DIR_LEFT);
            challenge.moveBugBackward(1);
            challenge.bug.pos.x.should.be.equal(1);

            challenge.bug.dir.set(challenge.DIR_TOP);
            challenge.moveBugBackward(1);
            challenge.bug.pos.y.should.be.equal(1);

            challenge.bug.dir.set(challenge.DIR_RIGHT);
            challenge.moveBugBackward(1);
            challenge.bug.pos.x.should.be.equal(0);

            challenge.bug.dir.set(challenge.DIR_BOTTOM);
            challenge.moveBugBackward(1);
            challenge.bug.pos.y.should.be.equal(0);

            done();
        });

        it('should make the bug move backward several times', function (done) {
            challenge.bug.dir.set(challenge.DIR_TOP);
            challenge.moveBugBackward(3);
            challenge.bug.pos.y.should.be.equal(3);
            done();
        });

        it('should be able to make the bug turn', function (done) {
            challenge.turnBugLeft(1);
            challenge.bug.dir.x.should.be.equal(challenge.DIR_TOP.x);
            challenge.bug.dir.y.should.be.equal(challenge.DIR_TOP.y);
            challenge.turnBugRight(1);
            challenge.bug.dir.x.should.be.equal(challenge.DIR_RIGHT.x);
            challenge.bug.dir.y.should.be.equal(challenge.DIR_RIGHT.y);
            done();
        });

        it('should make the bug turn several times', function (done) {
            challenge.turnBugLeft(10);
            challenge.bug.dir.x.should.be.equal(challenge.DIR_LEFT.x);
            challenge.bug.dir.y.should.be.equal(challenge.DIR_LEFT.y);
            challenge.turnBugRight(10);
            challenge.bug.dir.x.should.be.equal(challenge.DIR_RIGHT.x);
            challenge.bug.dir.y.should.be.equal(challenge.DIR_RIGHT.y);
            done();
        });

        it('should make the bug move forward when instruction is FO', function (done) {
            var result = challenge.tryChallenge('FO');
            challenge.bug.pos.x.should.be.equal(1);
            result.score.should.be.equal('0.00');
            done();
        });

        it('should make the bug move backward when instruction is BA', function (done) {
            var result = challenge.tryChallenge('(FO) 3 BA');
            challenge.bug.pos.x.should.be.equal(2);
            result.score.should.be.equal('0.00');
            done();
        });

        it('should make the bug turn left when instruction is LE', function (done) {
            var result = challenge.tryChallenge('LE');
            challenge.bug.dir.x.should.be.equal(challenge.DIR_TOP.x);
            challenge.bug.dir.y.should.be.equal(challenge.DIR_TOP.y);
            result.score.should.be.equal('0.00');
            done();
        });

        it('should make the bug turn right when instruction is RI', function (done) {
            var result = challenge.tryChallenge('RI');
            challenge.bug.dir.x.should.be.equal(challenge.DIR_BOTTOM.x);
            challenge.bug.dir.y.should.be.equal(challenge.DIR_BOTTOM.y);
            result.score.should.be.equal('0.00');
            done();
        });

        it('should win when the bug reaches the goal', function (done) {
            var result = challenge.tryChallenge('FO FO FO RI FO FO');
            result.win.should.be.equal(true);
            result.score.should.be.equal('11.00');
            done();
        });

        it('should win when the bug reaches the goal (parameter version)', function (done) {
            var result = challenge.tryChallenge('(FO) 3 RI (FO) 2');
            result.win.should.be.equal(true);
            result.score.should.be.equal('10.00');
            done();
        });

        it('should win when the bug reaches the goal (case insensitive version)', function (done) {
            challenge.tryChallenge('(fO) 3 RI (Fo) 2').win.should.be.equal(true);
            done();
        });

        it('should loose when the bug use all instructions without reaching the goal', function (done) {
            challenge.tryChallenge('RI FO FO').win.should.be.equal(false);
            done();
        });

        it('should return number the score when the goal is reached', function (done) {
            challenge.tryChallenge('FO FO FO RI FO FO').score.should.be.equal('11.00');
            done();
        });

        it('should loose when the bug hit a stone moving forward', function (done) {
            // BOTTOM
            challengeStone.tryChallenge('FO FO RI FO FO').win.should.be.equal(false);
            // TOP
            challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map);
            challengeStone.tryChallenge('RI (FO) 4 LE (FO) 2 LE (FO) 2').win.should.be.equal(false);
            // RIGHT
            challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map);
            challengeStone.tryChallenge('RI (FO) 2 LE (FO) 2').win.should.be.equal(false);
            // LEFT
            challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map);
            challengeStone.tryChallenge('(FO) 4 RI (FO) 2 RI (FO) 2').win.should.be.equal(false);

            done();
        });

        it('should loose when the bug hit a stone moving backward', function (done) {
            // BOTTOM
            challengeStone.tryChallenge('FO FO LE BA BA').win.should.be.equal(false);
            // TOP
            challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map);
            challengeStone.tryChallenge('RI (FO) 4 LE (FO) 2 RI (BA) 2').win.should.be.equal(false);
            // RIGHT
            challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map);
            challengeStone.tryChallenge('RI (FO) 2 RI (BA) 2').win.should.be.equal(false);
            // LEFT
            challengeStone = new Game(challengeStoneData.hashTag, challengeStoneData.map);
            challengeStone.tryChallenge('(FO) 4 RI (FO) 2 LE (BA) 2').win.should.be.equal(false);
            done();
        });

        it('should loose when the bug hit a stone in challenge 0xTEST2', function (done) {
            challenge0xTEST2.tryChallenge('RI (FO) 4 LE FO').win.should.be.equal(false);
            done();
        });

        it('should return the actual instructions used', function (done) {
            challenge.tryChallenge('FO (FO) 3 RI (RI) 5 LE (LE) 2 BA (BA) 2').instructions.join(';').should.be.equal('FO;FO;FO;FO;RI;RI;RI;RI;RI;RI;LE;LE;LE;BA;BA;BA');
            done();
        });

        it('should stop when the bug hit a stone', function (done) {
            challengeStone.tryChallenge('RI FO LE (FO) 3 RI FO').instructions.join(';').should.be.equal('RI;FO;LE;FO');
            challengeStone.bug.pos.x.should.be.equal(1);
            challengeStone.bug.pos.y.should.be.equal(1);
            done();
        });

        it('should loose when the bug goes out of the map', function (done) {
            challengeStone.tryChallenge('BA').win.should.be.equal(false);
            done();
        });

        it('should stop when the bug hit a web', function (done) {
            challengeCapsule.tryChallenge('RI FO LE FO RI FO LE FO FO').instructions.join(';').should.be.equal('RI;FO;LE;FO;RI;FO;LE');
            done();
        });

        it('should stop when the bug hit a missile launcher', function (done) {
            challengeCapsule.tryChallenge('RI FO FO FO FO FO').instructions.join(';').should.be.equal('RI;FO');
            done();
        });

        it('should destroy a web when triggering a missile with the right direction', function (done) {
            challengeCapsule.map[2][2].should.be.equal('3');
            challengeCapsule.tryChallenge('FO RI FO FO LE FO FO').win.should.be.equal(true);
            challengeCapsule.map[2][2].should.be.equal('o');
            done();
        });

        it('should destroy a web when triggering a missile with the right direction and exec challenge multiple times', function (done) {
            challengeCapsule.map[2][2].should.be.equal('3');
            challengeCapsule.tryChallenge('FO RI FO FO LE FO FO').win.should.be.equal(true);
            challengeCapsule.map[2][2].should.be.equal('o');

            challengeCapsule.restart();

            challengeCapsule.map[2][2].should.be.equal('3');
            challengeCapsule.tryChallenge('FO RI FO FO LE FO FO').win.should.be.equal(true);
            challengeCapsule.map[2][2].should.be.equal('o');
            done();
        });
    })
});