/**
 * P2P-Bomberman bomb entity.
 * Implementation of a bomberman's bomb. It can explode and will show an
 * explosion animation.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Inherit from EntityClass.
 */
BombClass.prototype = new EntityClass();
BombClass.prototype.parent = EntityClass.prototype;
BombClass.constructor = BombClass;

function BombClass() {
    // set cell margins for bomb explosions in px
    this._initialMargin = 25;
    this._finalMargin = 5;
    this._color = 'red';        // set color
    this._owner = null;         // ref. to a PlayerClass
    this._timerMs = Conf.bombTimerMs;       // bomb timer
    this._strength = 0;         // bomb strength in cells
    this._playerManager = null; // ref. to PlayerManagerClass
    this._p2pComm = null;       // ref. to P2PCommClass

    this._exploding 	= false;// is true while explosion animation is running
    this._explBlocked	= null;	// blocked explosion directions
    this._explWave 		= 0;    // current explosion wave radius
    this._explStartMs 	= 0;	// per wave
    this._explMaxMs		= 500;	// per wave

    this._bombDropTime      = 0;    // timestamp in ms when the bomb was dropped
    this._tickingBombFrame  = 0;    // ongoing ticking bomb frame counter
}

/**
 * Setup a bomb and set the view and player manager references.
 */
BombClass.prototype.setup = function(viewRef, playerManagerRef, p2pCommRef) {
    this.parent.setup.call(this, viewRef);   // parent call

    this._playerManager = playerManagerRef;
    this._p2pComm = p2pCommRef;
}

/**
 * Draw a bomb or a explosion animation
 */
BombClass.prototype.draw = function() {
    if (this._exploding) {	// draw the explosion animation
        this._drawExplAnim();
    } else {	// draw the bomb
    	this._drawTickingBombAnim();
    }
}

/**
 * Drop a bomb. <player> is the owner of the bomb.
 */
BombClass.prototype.dropByPlayer = function(player) {
	this._owner = player;

    // set bomb coordinates to the players coordinates
    var x = this._owner.x;
    var y = this._owner.y;

    // the strength comes from the player
	this._strength = this._owner.getBombStrength();

    // set this cell to 'occupied by a bomb'
    mapCellSet(x, y, 'B');

    // set the coordinates
	this.set(x, y);

    // add it to the view
	this._view.addEntityBeforeEntity(this, this._owner);

    // set the bomb drop time
    this._bombDropTime = currentMs();

    // set the timer for the explosion
	window.setTimeout(function() { this.explode(); }.bind(this), this._timerMs);
}

/**
 * Let the bomb explode.
 */
BombClass.prototype.explode = function() {
	if (this._strength == 0) return;

	console.log('BOOM!');

    // start the explosion
	this._exploding 	= true;   // will be checked in draw() function
	this._explWave 		= 1;
	this._explStartMs	= currentMs();
	this._explBlocked	= new Array();   // array of blocked field directions
}

/**
 * After the explosion animation this function will be called.
 */
BombClass.prototype.stopExplosion = function() {
	console.log('BUFF!');

    this._exploding 	= false;
    this._explWave 		= 0;
    this._explStartMs 	= 0;

    // set to free cell
    mapCellSet(this.x, this.y, ' ');

    // remove me
    this._view.removeEntity(this);
}

/**
 * Private method to check if an explosion direction in the direction
 * of <dx>, <dy> is blocked.
 */
BombClass.prototype._explDirectionIsBlocked = function(dx, dy) {
	if (this._explBlocked.length > 0) {
		for (var b = 0; b < this._explBlocked.length; b++) {
			var blockedCellDir = this._explBlocked[b];
			// console.log('blocked dir is ' + dx + ', ' + dy);
			if (blockedCellDir[0] == dx && blockedCellDir[1] == dy) {
				return true;
			}
		}
	}

	return false;
}

/**
 *  Check if a player was hit on explosion field at position <ex>, <ey>
 */
BombClass.prototype._checkPlayerHits = function(ex, ey) {
    var players = this._playerManager.getPlayers();

    // go through all players
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.getAlive() === true && player.x === ex && player.y === ey) { // we hit a player!
            player.setAlive(false);
            this._playerManager.checkGameStatus();
        }
    }
}

/**
 * Draw the explosion animation. Explosions spread by waves.
 * Depending on the bomb's strength, the explosions spreads to more and more fields
 * in each direction.
 */
BombClass.prototype._drawExplAnim = function() {
    var progress = currentMs() - this._explStartMs;
    if (progress >= this._explMaxMs) {  // check if we can go to the next explosion wave
        if (this._explWave >= this._strength) { // check if we can stop the explosion
            this.stopExplosion();
            return;
        }

        // go to the next wave
        this._explStartMs   = currentMs();
        this._explWave++;
    }

    // progress percentage
    var progrPerc = progress / this._explMaxMs;

    // go in each direction (dy, dx)
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            if (Math.abs(dx) + Math.abs(dy) == 2) continue;     // no explosion on diagonal fields
            if (this._explDirectionIsBlocked(dx, dy)) continue; // no explosion in blocked directions

            // calculate position of the explosion wave field
            var posX = this.x + dx * this._explWave;
            var posY = this.y + dy * this._explWave;

            // check limits
            if (posX < 0 || posX >= MapDimensions.w 
                || posY < 0 || posY >= MapDimensions.h) continue;

            // check if we hit a player
            this._checkPlayerHits(posX, posY);

            if (dx == 0 && dy == 0) continue;               // no explosion on own field

            // get the cell type of this field
            var cellType = mapCellType(posX, posY);

            if (cellType === 'X') { // blocked!
                // console.log('added blocked dir ' + dx + ', ' + dy);
                this._explBlocked.push(new Array(dx, dy));
                continue;
            }

            if (cellType === 'x') { // break this!
                var newType = ' ';
                if (this._owner.getType() !== PlayerTypeRemote  // if this bomb is owned by the local player
                 && Math.random() < Conf.upgradePossibility) {  // and we're lucky
                    newType = 'U';  // set an upgrade in this cell

                    if (gameMode === GameModeMultiPlayer) {
                        // bring the news to our peers
                        var msg = {
                            id:     this._owner.getId(),
                            type:   MsgTypePlayerUpgrade,
                            pos:    new Array(posX, posY)
                        };
                        this._p2pComm.sendAll(msg);
                    }
                }

                mapCellSet(posX, posY, newType);    // set the new cell type to either free or upgrade field
            }

            // calculate the explosion color
            var colorR = 255 - progrPerc * 100;
            var colorG = 30 + progrPerc * 127;
            var colorA = 1.0 - progrPerc;
            style = 'rgba(' + colorR.toFixed() + ', ' + colorG.toFixed() + ', 0, ' + colorA.toFixed() + ')';

            // draw the cell with the explosion color
            this._view.drawCell(posX, posY, style);
        }
    }
}

/**
 * Draw the ticking bomb animation with a pulsating, growing bomb.
 */
BombClass.prototype._drawTickingBombAnim = function() {
    this._tickingBombFrame = (this._tickingBombFrame + 1) % 60;
    var dM = this._finalMargin - this._initialMargin;
    var min = this._initialMargin + (currentMs() - this._bombDropTime) * dM / this._timerMs;
    var a = this._finalMargin - dM;
    var margin = min + a/2.0 * Math.sin(Math.PI * (this._tickingBombFrame / 60.0));

    this._view.drawCellCircle(this.x, this.y, margin, this._color);
}
