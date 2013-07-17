/**
 * P2P-Bomberman game manager class.
 * Handles overall game management.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Define game types.
 */
var GameModeSinglePlayer 	= 0;
var GameModeMultiPlayer 	= 1;

/**
 * Game class contructor. Create a new game with game mode <mode> of type GameMode*.
 */
function GameClass(mode) {
    this._view 			= null;	// ViewClass object
    this._map 			= null;	// MapClass object
    this._controls 		= null;	// ControlsClass object
    this._playerManager = null;	// PlayerManagerClass object
    this._p2pComm		= null;	// P2PCommClass object (MP only)

	this._mode = mode;	// game mode
}

/**
 * Set up a new game.
 */
GameClass.prototype.setup = function(playerManagerRef, p2pCommRef) {
	// create all objects or set references to them
    this._view 			= new ViewClass();
    this._map 			= new MapClass();
    this._controls 		= new Array();
    this._p2pComm 		= p2pCommRef;

    if (playerManagerRef === null) {
    	this._playerManager = new PlayerManagerClass();
    } else {
    	this._playerManager = playerManagerRef;
    }

    // set up the view and the map
    this._view.setup(MapDimensions.w, MapDimensions.h);
    this._map.setup(this._view);

    if (gameMode === GameModeMultiPlayer) {
		this._map.setP2PComm(this._p2pComm);
    }

    // set up the player manager
    this._playerManager.setup(this._map, this._p2pComm);
}

/**
 * Start a new game.
 */
GameClass.prototype.startGame = function() {
	// add the map as background entity
	this._view.addEntity(this._map);

	// initialize game in single player mode
	if (this._mode === GameModeSinglePlayer) {
		// init local player 1
		var player1 = new PlayerClass(PlayerTypeLocalKeyboardArrows);
		player1.setup(this._view, this._playerManager, null);
		player1.setId(0);
		player1.setColor(PlayerColors[0]);
		this._view.addEntity(player1);
		this._playerManager.addPlayer(player1);

		// set player1 controls to arrow keys
		var player1Controls = new ControlsClass();
		player1Controls.setup(player1, Conf.arrowKeyMapping);
		this._controls.push(player1Controls);

		// init local player 2
		var player2 = new PlayerClass(PlayerTypeLocalKeyboardWSAD);
		player2.setup(this._view, this._playerManager, null);
		player2.setId(1);
		player2.setColor(PlayerColors[1]);
		this._view.addEntity(player2);
		this._playerManager.addPlayer(player2);

		// set player2 controls to WSAD
		var player2Controls = new ControlsClass();
		player2Controls.setup(player2, Conf.wsadKeyMapping);
		this._controls.push(player2Controls);
	} else {	// initialize game in multi player mode
		// set up the local player
		var localPlayer = this._playerManager.getLocalPlayer();
		var localPlayerControls = new ControlsClass();
		localPlayerControls.setup(localPlayer, Conf.arrowKeyMapping);
		this._controls.push(localPlayerControls);

		// set up all players
		this._playerManager.setupPlayers(this._view, lounge._p2pComm);

		// add the players as entities
		var players = this._playerManager.getPlayers();
		for (var i = 0; i < players.length; i++) {
			this._view.addEntity(players[i]);
		}
	}
    
    // spawn all players
    this._playerManager.spawnAllPlayers();

    // start draw update
	this.frame();
}

/**
 * Stop the game.
 */
GameClass.prototype.stopGame = function() {
	// not implemented yet.
}

/**
 * Game round ended.
 */
GameClass.prototype.roundEnded = function() {
	// not implemented yet.
}

/**
 * Draw view update.
 */
GameClass.prototype.frame = function() {
    this._view.update();

    // request new frame
    requestAnimFrame(function() {
        this.frame();
    }.bind(this));
}


