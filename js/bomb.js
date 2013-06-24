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
    this._initialMargin = 25;
    this._finalMargin = 5;
    this._color = 'red';
    this._owner = null;         // ref. to a PlayerClass
    this._timerMs = Conf.bombTimerMs;       // bomb timer
    this._strength = 0;         // bomb strength in cells
    this._playerManager = null; // ref. to PlayerManagerClass

    this._exploding 	= false;// is true while explosion animation is running
    this._explBlocked	= null;	// blocked explosion directions
    this._explWave 		= 0;    // current explosion wave radius
    this._explStartMs 	= 0;	// per wave
    this._explMaxMs		= 500;	// per wave
}

/**
 * Setup a bomb and set the view and player manager references.
 */
BombClass.prototype.setup = function(viewRef, playerManagerRef) {
    this.parent.setup.call(this, viewRef);   // parent call

    this._playerManager = playerManagerRef;
}

/**
 * Draw a bomb or a explosion animation
 */
BombClass.prototype.draw = function() {
    if (this._exploding) {	// draw the explosion animation
    	var progress = currentMs() - this._explStartMs;
    	if (progress >= this._explMaxMs) {
    		if (this._explWave >= this._strength) {
    			this.stopExplosion();
    			return;
    		}

    		this._explStartMs	= currentMs();
    		this._explWave++;
    	}

    	var progrPerc = progress / this._explMaxMs;

    	for (var dy = -1; dy <= 1; dy++) {
    		for (var dx = -1; dx <= 1; dx++) {
    			if (Math.abs(dx) + Math.abs(dy) == 2) continue;		// no explosion on diagonal fields
    			if (this._explDirectionIsBlocked(dx, dy)) continue;	// no explosion in blocked directions

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

    			if (cellType === 'X') {	// blocked!
    				// console.log('added blocked dir ' + dx + ', ' + dy);
    				this._explBlocked.push(new Array(dx, dy));
    				continue;
    			}

    			if (cellType === 'x') {	// break this!
    				mapCellSet(posX, posY, ' ');
    			}

    			//console.log('drawing explosion in cell ' + posX + ', ' + posY);
    			var colorR = 255 - progrPerc * 100;
    			var colorG = 30 + progrPerc * 127;
    			var colorA = 1.0 - progrPerc;
    			style = 'rgba(' + colorR.toFixed() + ', ' + colorG.toFixed() + ', 0, ' + colorA.toFixed() + ')';
    			this._view.drawCell(posX, posY, style);
    		}
    	}
    } else {	// draw the bomb
    	this._view.drawCellCircle(this.x, this.y, this._initialMargin, this._color);
    }
}

/**
 * Drop a bomb. <player> is the owner of the bomb.
 */
BombClass.prototype.dropByPlayer = function(player) {
	this._owner = player;

    var x = this._owner.x;
    var y = this._owner.y;

	this._strength = this._owner.getBombStrength();

    mapCellSet(x, y, 'B');  // set this cell to 'occupied by a bomb'

	this.set(x, y);
	this._view.addEntityBeforeEntity(this, this._owner);

	window.setTimeout(function() { this.explode(); }.bind(this), this._timerMs);
}

/**
 * Let the bomb explode.
 */
BombClass.prototype.explode = function() {
	if (this._strength == 0) return;

	console.log('BOOM!');

	this._exploding 	= true;
	this._explWave 		= 1;
	this._explStartMs	= currentMs();
	this._explBlocked	= new Array();
}

/**
 * After the eplosion animation this function will be called.
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
 *  Check if a player was hit on explosion field at position ex, ey
 */
BombClass.prototype._checkPlayerHits = function(ex, ey) {
    var players = this._playerManager.getPlayers();

    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.getAlive() === true && player.x === ex && player.y === ey) {
            player.setAlive(false);
            this._owner.increaseBombStrength();
            this._playerManager.checkGameStatus();
        }
    }
}