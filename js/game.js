var GameModeSinglePlayer 	= 0;
var GameModeMultiPlayer 	= 1;

function GameClass(mode) {
    this._view 			= null;
    this._map 			= null;
    this._controls 		= null;
    this._playerManager = null;

	this._mode = mode;
}

GameClass.prototype.setup = function() {
    this._view 			= new ViewClass();
    this._map 			= new MapClass();
    this._controls 		= new Array();
    this._playerManager = new PlayerManagerClass();

    this._view.setup(MapDimensions.w, MapDimensions.h);
    this._map.setup(this._view);

    this._playerManager.setup(this._map);
}

GameClass.prototype.startGame = function() {
	this._view.addEntity(this._map);

	if (this._mode === GameModeSinglePlayer) {
		var player1 = new PlayerClass(PlayerTypeLocalKeyboardArrows);
		player1.setup(this._view, this._playerManager);
		this._view.addEntity(player1);
		this._playerManager.addPlayer(player1);
		var player1Controls = new ControlsClass();
		player1Controls.setup(player1, new Array(
			'left', 'right',
			'up', 'down',
			'b'
		));
		this._controls.push(player1Controls);

		var player2 = new PlayerClass(PlayerTypeLocalKeyboardWSAD);
		player2.setup(this._view, this._playerManager);
		this._view.addEntity(player2);
		this._playerManager.addPlayer(player2);

		var player2Controls = new ControlsClass();
		player2Controls.setup(player2, new Array(
			'a', 'd',
			'w', 's',
			'x'
		));
		this._controls.push(player2Controls);
	}
    
    this._playerManager.spawnAllPlayers();

	this.frame();
}

GameClass.prototype.stopGame = function() {

}

GameClass.prototype.roundEnded = function() {
	console.log('round ended');
}

GameClass.prototype.frame = function() {
    this._view.update();

    // request new frame
    requestAnimFrame(function() {
        this.frame();
    }.bind(this));
}


