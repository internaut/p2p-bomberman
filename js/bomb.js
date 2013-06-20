BombClass.prototype = new EntityClass();
BombClass.prototype.parent = EntityClass.prototype;
BombClass.constructor = BombClass;

function BombClass() {
    this._initialMargin = 25;
    this._finalMargin = 5;
    this._color = 'red';
    this._owner = null;
    this._timerMs = 2000;
    this._strength = 0;
    this._playerManager = null;

    this._exploding 	= false;
    this._explBlocked	= null;	// blocked explosion directions
    this._explWave 		= 0;
    this._explStartMs 	= 0;	// per wave
    this._explMaxMs		= 500;	// per wave
}

BombClass.prototype.setup = function(viewRef, playerManagerRef) {
    this.parent.setup.call(this, viewRef);   // parent call

    this._playerManager = playerManagerRef;
}

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

BombClass.prototype.dropByPlayer = function(player) {
	this._owner = player;
	this._strength = this._owner.bombStrength;
	this.set(this._owner.x, this._owner.y);
	this._view.addEntityBeforeEntity(this, this._owner);

	window.setTimeout(function() { this.explode(); }.bind(this), this._timerMs);
}

BombClass.prototype.explode = function() {
	if (this._strength == 0) return;

	console.log('BOOM!');

	this._exploding 	= true;
	this._explWave 		= 1;
	this._explStartMs	= currentMs();
	this._explBlocked	= new Array();
}

BombClass.prototype.stopExplosion = function() {
	console.log('BUFF!');

    this._exploding 	= false;
    this._explWave 		= 0;
    this._explStartMs 	= 0;

    // remove me
    this._view.removeEntity(this);
}

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
            this._playerManager.checkGameStatus();
        }
    }
}