function ControlsClass() {
	this._player = null;
}

ControlsClass.prototype.setup = function(playerRef, keyConf) {
    this._player = playerRef;

    $(document).bind('keydown', keyConf[0], function() { this.moveLeft(); 	}.bind(this));
    $(document).bind('keydown', keyConf[1],	function() { this.moveRight(); 	}.bind(this));
    $(document).bind('keydown', keyConf[2], function() { this.moveUp(); 	}.bind(this));
    $(document).bind('keydown', keyConf[3], function() { this.moveDown(); 	}.bind(this));
    $(document).bind('keydown', keyConf[4], function() { this.dropBomb(); 	}.bind(this));
}

ControlsClass.prototype.moveLeft = function() {
	this._player.moveBy(-1, 0);
}

ControlsClass.prototype.moveRight = function() {
	this._player.moveBy(1, 0);
}

ControlsClass.prototype.moveUp = function() {
	this._player.moveBy(0, -1);
}

ControlsClass.prototype.moveDown = function() {
	this._player.moveBy(0, 1);
}

ControlsClass.prototype.dropBomb = function() {
	this._player.dropBomb();
}