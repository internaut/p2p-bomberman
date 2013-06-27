/**
 * P2P-Bomberman game lounge class.
 * Handles pre-game management.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

function LoungeClass(mode) {
	this._gameMode 		= mode;
	this._gameId 		= 0;
	this._playerId 		= 0;
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
	// show the necessary divs
	$('#singleplayer_conf').show();

	// bind handlers
	$('#singleplayer_start_btn').click(function() {
		window.location = 'game.html?mode=' + this._gameMode;
	}.bind(this));
}

/**
 * Make special setup for multiplayer mode
 */
LoungeClass.prototype._setupMP = function() {
	// show the necessary divs
	$('#multiplayer_conf').show();
	$('#playerlist').show();
	$('#name').attr('disabled');

	// bind handlers
	$('#name').change(function() {
		this._nameChanged($('#name').val());
	}.bind(this));

	// set up P2P comm.
	this._p2pComm = new P2PCommClass();
	this._p2pComm.setup();

	if (this._gameId === 0) {	// create a new game
		$('#game_conn_status').text('creating game...');

		this._p2pComm.createGame(function(id) {
			this._gameId = id;
			$('#game_id').text(this._gameId);	// set the game id when we got it from the server.

			$('#game_conn_status').text('created');
			$('#game_conn_status').removeClass('status_unknown').addClass('ok');

			this._postConnectionSetup();
		}.bind(this), function(err) {
			$('#game_conn_status').text('oops!');
			$('#game_conn_status').removeClass('status_unknown').addClass('not_ok');
		}.bind(this));
	} else {
		$('#game_id').text(this._gameId);	// set the game id

		$('#game_conn_status').text('joining...');

		this._p2pComm.joinGame(this._gameId, function() {
			$('#game_conn_status').text('joined');
			$('#game_conn_status').removeClass('status_unknown').addClass('ok');

			this._postConnectionSetup();
		}.bind(this), function(err) {
			$('#game_conn_status').text('oops!');
			$('#game_conn_status').removeClass('status_unknown').addClass('not_ok');
		}.bind(this));
	}
}

LoungeClass.prototype._postConnectionSetup = function() {
	this._playerId = this._p2pComm.getPeerId();

	$('#name').val('player_' + this._playerId);
	$('#name').removeAttr('disabled');
}

LoungeClass.prototype._nameChanged = function(v) {
	this._p2pComm.sendAll({name: v});
}