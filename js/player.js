/**
 * P2P-Bomberman player entity.
 * Implementation of a player that can be controlled locally (by ControlsClass)
 * or is controlled remotely.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Define player status values.
 */
var PlayerStatusNotReady    = 1;
var PlayerStatusReady       = 2;

/**
 * Define player types.
 */
var PlayerTypeLocalKeyboardArrows  = 0;
var PlayerTypeLocalKeyboardWSAD    = 1;
var PlayerTypeLocalAI              = 2;    // not supported yet
var PlayerTypeRemote               = 3;

/**
 * Inherit from EntityClass.
 */
PlayerClass.prototype = new EntityClass();
PlayerClass.constructor = PlayerClass;
PlayerClass.prototype.parent = EntityClass.prototype;

/**
 * Contructor with <type> being one of the PlayerType* values.
 */
function PlayerClass(type) {
    this._margin = 5;
    if (type === PlayerTypeLocalKeyboardArrows) {
        this._color = 'green';
    } else if (type === PlayerTypeLocalKeyboardWSAD) {
        this._color = 'blue';
    }
    
    this._id = 0;               // peer id
    this._name = '';            // user name
    this._alive = true;         // status
    this._status = PlayerStatusNotReady;    // ready/not ready
    this._type = type;          // type
    this._playerManager = null; // ref. to PlayerManagerClass

    this._bombStrength = 1;     // bomb strength given to the bombs of this player
}

/**
 * Setup a bomb and set the view and player manager references.
 */
PlayerClass.prototype.setup = function(viewRef, playerManagerRef) {
    this.parent.setup.call(this, viewRef);   // parent call

    this._playerManager = playerManagerRef;
}

/**
 * Return the player type.
 */
PlayerClass.prototype.getType = function() {
    return this._type;
}

/**
 * Set the player type to <t> being one of the PlayerType* values.
 */
PlayerClass.prototype.setType = function(t) {
    this._type = t;

    return this;
}

/**
 * Set the player alive status to <v> true/false.
 */
PlayerClass.prototype.setAlive = function(v) {
    this._alive = v;

    return this;
}

/**
 * Get the player alive status.
 */
PlayerClass.prototype.getAlive = function() {
    return this._alive;
}

/**
 * Return the player name
 */
PlayerClass.prototype.getName = function() {
    return this._name;
}

/**
 * Set the player name to string <s>.
 */
PlayerClass.prototype.setName = function(s) {
    this._name = s;

    return this;
}

/**
 * Return the peer id.
 */
PlayerClass.prototype.getId = function() {
    return this._id;
}

/**
 * Set the peer id to <id>.
 */
PlayerClass.prototype.setId = function(id) {
    this._id = id;

    return this;
}

/**
 * Return the player status.
 */
PlayerClass.prototype.getStatus = function() {
    return this._status;
}

/**
 * Set the player status to <status>
 */
PlayerClass.prototype.setStatus = function(status) {
    this._status = status;

    return this;
}

/**
 * Return the bomb strength of this player.
 */
PlayerClass.prototype.getBombStrength = function() {
    return this._bombStrength;
}

/**
 * Increase the bomb strength of this player by 1 until Conf.maxBombStrength.
 */
PlayerClass.prototype.increaseBombStrength = function() {
    if (this._bombStrength < Conf.maxBombStrength) {
        this._bombStrength++;
    }
}

/**
 * Draw the player when he is alive.
 */
PlayerClass.prototype.draw = function() {
    if (this._alive) {
        this._view.drawCellRhombus(this.x, this.y, this._margin, this._color);
    }
}

/**
 * Move the player by <dX>, <dY>.
 */
PlayerClass.prototype.moveBy = function(dX, dY) {
    if (!this._alive) return;

    // set the destination position
    var destX = this.x + dX;
    var destY = this.y + dY;

    // check if we are still in the map.
    if (destX < 0 || destX >= MapDimensions.w) destX = this.x;
    if (destY < 0 || destY >= MapDimensions.h) destY = this.y;

    if (mapCellIsFree(destX, destY)) {  // check if the cell is free
        this.set(destX, destY);         // set the position
    }
}

/**
 * Drop a bomb.
 */
PlayerClass.prototype.dropBomb = function() {
    if (!this._alive || mapCellType(this.x, this.y) === 'B') return;

    var bomb = new BombClass();
    bomb.setup(this._view, this._playerManager);
    bomb.dropByPlayer(this);
}