function ControlsClass() {
	this._player = null;
}

ControlsClass.prototype.setup = function(playerRef) {
    this._player = playerRef;

    $(document).bind('keydown', 'left', 	function() { this.moveLeft(); 	}.bind(this));
    $(document).bind('keydown', 'right',	function() { this.moveRight(); 	}.bind(this));
    $(document).bind('keydown', 'up', 		function() { this.moveUp(); 	}.bind(this));
    $(document).bind('keydown', 'down', 	function() { this.moveDown(); 	}.bind(this));
    $(document).bind('keydown', 'b', 		function() { this.dropBomb(); 	}.bind(this));
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