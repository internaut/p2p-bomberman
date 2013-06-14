BombClass.prototype = new EntityClass();
BombClass.constructor = BombClass;

function BombClass() {
    this._initialMargin = 25;
    this._finalMargin = 5;
    this._color = 'red';
    this._owner = null;
    this._timerMs = 2000;
    this._strength = 0;
}

BombClass.prototype.draw = function() {
    this._view.drawCellCircle(this.x, this.y, this._initialMargin, this._color);
}

BombClass.prototype.dropByPlayer = function(player) {
	this._owner = player;
	this._strength = this._owner.bombStrength;
	this.set(this._owner.x, this._owner.y);
	this._view.addEntityBeforeEntity(this, this._owner);

	window.setTimeout(function() { this.explode(); }.bind(this), this._timerMs);
}

BombClass.prototype.explode = function() {
	
}