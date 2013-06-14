BombClass.prototype = new EntityClass();
BombClass.constructor = BombClass;

function BombClass() {
    this._initialMargin = 25;
    this._finalMargin = 5;
    this._color = 'red';
    this._owner = null;
    this._timerMs = 2000;
    this._strength = 0;

    this._exploding 	= false;
    this._explWave 		= 0;
    this._explStartMs 	= 0;	// per wave
    this._explMaxMs		= 500;	// per wave
}

BombClass.prototype.draw = function() {
    this._view.drawCellCircle(this.x, this.y, this._initialMargin, this._color);

    if (this._exploding) {
    	var progress = currentMs() - this._explStartMs;
    	if (progress >= this._explMaxMs) {
    		if (this._explWave >= this._strength) {
    			this.stopExplosion();
    			return;
    		}

    		this._explStartMs	= currentMs();
    		this._explWave++;
    	}

    	// explode in 4 directions
    	for (var dy = -1; dy <= 1; dy++) {
    		for (var dx = -1; dx <= 1; dx++) {
    			if (dx == 0 && dy == 0) continue;
    			if (Math.abs(dx) + Math.abs(dy) == 2) continue;

    			var posX = this.x + dx * this._explWave;
    			var posY = this.y + dy * this._explWave;
    			console.log('drawing explosion in cell ' + posX + ', ' + posY);
    			style = 'rgba(255, 0, 0, 127)';
    			this._view.drawCell(posX, posY, 'yellow');
    		}
    	}
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
}

BombClass.prototype.stopExplosion = function() {
	console.log('BUFF!');

    this._exploding 	= false;
    this._explWave 		= 0;
    this._explStartMs 	= 0;

    // remove me!
}