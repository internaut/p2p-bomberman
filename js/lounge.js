/**
 * P2P-Bomberman game lounge class.
 * Handles pre-game management.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

function LoungeClass(mode) {
	this._gameMode 		= mode;
	this._gameId 		= 0;
	this._serverComm 	= null;
	this._p2pComm 		= null;
}

/**
 * Set up the game lounge.
 * If in MP mode, this function requires a <gameId> to join to. If
 * <gameId> is 0, we will create a new MP game.
 */
LoungeClass.prototype.setup = function(gameId) {
	console.log('Setting up lounge in mode ' + this._gameMode + ' and game id ' + gameId);

	// show necessary elements
	if (this._gameMode === GameModeSinglePlayer) {
		this._setupSP();
	} else {
		this._gameId = gameId;
		this._setupMP();
	}
}

/**
 * Make special setup for singleplayer mode
 */
LoungeClass.prototype._setupSP = function() {
	$('#singleplayer_conf').show();
	$('#singleplayer_start_btn').click(function() {
		window.location = 'game.html?mode=' + this._gameMode;
	}.bind(this));
}

/**
 * Make special setup for multiplayer mode
 */
LoungeClass.prototype._setupMP = function() {
	$('#multiplayer_conf').show();
	$('#playerlist').show();

	if (this._gameId === 0) {
		this._serverComm = new ServerCommClass();
		this._serverComm.setup();

		this._gameId = this._serverComm.createGame(function(id) {
			this._gameId = id;
			$('#game_id').text(this._gameId);	// set the game id when we got it from the server.
		}.bind(this));
	} else {
		$('#game_id').text(this._gameId);	// set the game id
		
		this._p2pComm = new P2PCommClass();
		this._p2pComm.setup(null);
		this._p2pComm.joinGame(this._gameId);
	}
}