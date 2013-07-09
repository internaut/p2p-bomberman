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
 * Define possible player colors.
 */
var PlayerColors = new Array(
    'gold',
    'blue',
    'deeppink',
    'lime'
);

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
    this._color = PlayerColors[0];  // set default color

    this._id = 0;               // peer id
    this._name = '';            // user name
    this._alive = true;         // status
    this._status = PlayerStatusNotReady;    // ready/not ready
    this._type = type;          // type
    this._spawnPoint = null;    // spawn point with x and y coord. in array of size 2
    this._playerManager = null; // ref. to PlayerManagerClass
    this._p2pComm = null;       // P2P Communication Class (only MP)

    this._bombStrength = 1;     // bomb strength given to the bombs of this player
}

/**
 * Setup a bomb and set the view and player manager references.
 */
PlayerClass.prototype.setup = function(viewRef, playerManagerRef, p2pRef) {
    this.parent.setup.call(this, viewRef);   // parent call

    this._playerManager = playerManagerRef;

    // set p2p class and our message handlers
    if (p2pRef) {
        this._p2pComm = p2pRef;
        this._p2pComm.setMsgHandler(MsgTypePlayerPos,  this, this.receivePos, true);
        this._p2pComm.setMsgHandler(MsgTypePlayerBomb, this, this.receiveBomb, true);
    }
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
    // set the status
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
 * Set the player color.
 */
PlayerClass.prototype.getColor = function() {
    return this._color;
}

/**
 * Get the player color.
 */
PlayerClass.prototype.setColor = function(c) {
    this._color = c;

    return this;
}

/**
 * Will set the spawn point and the current entity coordinates
 * to <p[0]>, <p[1]>
 */
PlayerClass.prototype.setSpawnPoint = function(p) {
    this._spawnPoint = new Array(p[0], p[1]);   // copy
    this.set(p[0], p[1]);

    return this;
}

/**
 * Return the spawn point
 */
PlayerClass.prototype.getSpawnPoint = function() {
    return this._spawnPoint;
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

        console.log('bomb strength of player ' + this._id + ' is now ' + this._bombStrength);
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
        if (gameMode === GameModeMultiPlayer) {
            this.sendPos(destX, destY);
        }
        this.set(destX, destY);         // set the position
        this._checkDestinationCell(destX, destY);
    }
}

/**
 * Drop a bomb.
 */
PlayerClass.prototype.dropBomb = function() {
    if (!this._alive || mapCellType(this.x, this.y) === 'B') return;

    if (gameMode === GameModeMultiPlayer) { // send it to our peers
        this.sendBombDrop(this.x, this.y);
    }

    // drop the bomb
    this._dropBombByPlayer(this);
}

PlayerClass.prototype._dropBombByPlayer = function(player) {
    var bomb = new BombClass();
    bomb.setup(this._view, this._playerManager, this._p2pComm);
    bomb.dropByPlayer(player);
}

/**
 * Send our position <x>, <y> to the peers (MP only).
 */
PlayerClass.prototype.sendPos = function(x, y) {
    if (this._type === PlayerTypeRemote) return;    // NOT for remote players

    var msg = {
        id:     this._id,
        type:   MsgTypePlayerPos,
        pos:    new Array(x, y)
    };

    this._p2pComm.sendAll(msg);
}

/**
 * Receive a position message and interpret it.
 */
PlayerClass.prototype.receivePos = function(conn, msg) {
    // console.log('received pos of player ' + msg.id + ': ' + msg.pos[0] + ', ' + msg.pos[1]);
    // console.log('> this player is ' + this._id + ' with type ' + this._type);
    if (this._type !== PlayerTypeRemote // ONLY for remote players
     || msg.id !== this._id) return;    // ONLY if the ids match

    // set the position
    this.set(msg.pos[0], msg.pos[1]);
    this._checkDestinationCell(msg.pos[0], msg.pos[1]);
}

/**
 * Send that we've dropped a bomb at <x>, <y>. Our peers should know!
 */
PlayerClass.prototype.sendBombDrop = function(x, y) {
    if (this._type === PlayerTypeRemote) return;    // NOT for remote players

    // we only send the event and the peer id
    var msg = {
        id:     this._id,
        type:   MsgTypePlayerBomb
    };

    this._p2pComm.sendAll(msg);
}

/**
 * Receive a "bomb has been dropped" message and interpret it.
 */
PlayerClass.prototype.receiveBomb = function(conn, msg) {
    if (this._type !== PlayerTypeRemote // ONLY for remote players
     || msg.id !== this._id) return;    // ONLY if the ids match

    // let the player drop the bomb
    this._dropBombByPlayer(this);
}

PlayerClass.prototype._checkDestinationCell = function(destX, destY) {
    if (mapCellType(destX, destY) === 'U') {
        this.increaseBombStrength();
        mapCellSet(destX, destY, ' ');
    }
}

// PlayerClass.prototype.receiveUpgrade = function(conn, msg) {
//     if (this._type !== PlayerTypeRemote // ONLY for remote players
//      || msg.id !== this._id) return;    // ONLY if the ids match

//     // increase our bomb strength
//     this.increaseBombStrength(false);
//     mapCellSet(msg.pos[0], msg.pos[1], ' ');
// }
