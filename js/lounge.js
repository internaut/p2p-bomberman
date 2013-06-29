/**
 * P2P-Bomberman game lounge class.
 * Handles pre-game management.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

var PlayerStatusNotReady 	= 1;
var PlayerStatusReady 		= 2;

function LoungeClass(mode) {
	this._gameMode 		= mode;
	this._playerId 		= 0;
	this._playerName	= '';
	this._playerStatus	= PlayerStatusNotReady;
	this._p2pComm 		= null;
	this._connPlayers	= new Object();	// connected players with id -> name, status mapping
}

/**
 * Set up the game lounge.
 * If in MP mode, this function requires a <joinId> to join to. If
 * <joinId> is 0, we will create a new MP game.
 */
LoungeClass.prototype.setup = function(joinId) {
	console.log('Setting up lounge in mode ' + this._gameMode + ' and join id ' + joinId);

	// show necessary elements
	if (this._gameMode === GameModeSinglePlayer) {
		this._setupSP();
	} else {
		this._setupMP(joinId);
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
LoungeClass.prototype._setupMP = function(joinId) {
	// show the necessary divs
	$('#multiplayer_conf').show();
	$('#playerlist').show();
	$('#name').attr('disabled');

	// bind handlers
	$('#name').change(function() {
		this._nameChanged($('#name').val());
	}.bind(this));
	$('#ready').change(function() {
		this._statusChanged($('#ready:checked').val());
	}.bind(this));

	// set up P2P comm.
	this._p2pComm = new P2PCommClass();
	this._p2pComm.setup();

	$('#player_conn_status').text('receiving peer id...');
	this._p2pComm.createPeer(function(id){
		this.player_id = id;
		$('#player_id').text(this.player_id);	// set the player id when we got it from the server.
		$('#player_conn_status').text('awaiting connections');
		$('#player_conn_status').removeClass('status_unknown').addClass('ok');

		this._postConnectionSetup();

		if (joinId !== 0) {	// join a player
			this._p2pComm.joinPeer(joinId);
		}
	}.bind(this), function(err) {
		$('#player_conn_status').text('oops! no peer id!');
		$('#player_conn_status').removeClass('status_unknown').addClass('not_ok');
	}.bind(this));
}

LoungeClass.prototype._joiningPeer = function(peerId) {
	$('#player_conn_status').text('joining ' + peerId + '...');
}

LoungeClass.prototype._joinedPeer = function(peerId) {
	$('#player_conn_status').text('awaiting connections');
	this._sendOwnStatus(peerId);
}

LoungeClass.prototype._errorJoiningPeer = function(err) {
	$('#player_conn_status').text('oops! error joining!');
	$('#player_conn_status').removeClass('status_unknown').addClass('not_ok');
}

LoungeClass.prototype._postConnectionSetup = function() {
	this._playerId = this._p2pComm.getPeerId();
	this._playerName = 'player_' + this._playerId;
	$('#name').val(this._playerName);
	$('#name').removeAttr('disabled');

	this._p2pComm.setConnEstablishingHandler(this, this._joiningPeer, this._joinedPeer, this._errorJoiningPeer);
	this._p2pComm.setConnOpenedHandler(this, this._playerConnected);
	this._p2pComm.setConnClosedHandler(this, this._playerDisconnected);
	this._p2pComm.setMsgHandler(MsgTypePlayerMetaData, this, this._receivedPlayerMetaData);

	this._addPlayerToList(this._playerId, this._playerName);
}

LoungeClass.prototype._addPlayerToList = function(id, playerName) {
	var playerNameField = $('#playerlist_id_' + id);
	if (this._connPlayers.hasOwnProperty(id)) {
		delete this._connPlayers[id];
		if (playerNameField) playerNameField.detach();
	}

	this._connPlayers[id] = {name: playerName, status: PlayerStatusNotReady};

	var list = $('#playerlist > ul');
	var htmlId = 'playerlist_id_' + id;
	var elem = '<li id="' + htmlId + '" class="not_ok">' + playerName + '</li>';
	list.append(elem);
}

LoungeClass.prototype._updatePlayerList = function(id, playerName, status) {
	var elem = $('#playerlist_id_' + id);

	delete this._connPlayers[id];
	this._connPlayers[id] = {name: playerName, status: PlayerStatusNotReady};

	elem.text(playerName);
	if (status === PlayerStatusNotReady) {
		elem.removeClass('ok').addClass('not_ok');
	} else if (status === PlayerStatusReady) {
		elem.removeClass('not_ok').addClass('ok');
	}
}

LoungeClass.prototype._nameChanged = function(v) {
	this._playerName = v;
	this._sendOwnStatus(0);	// to all
	this._updatePlayerList(this._playerId, this._playerName, this._playerStatus);
}

LoungeClass.prototype._statusChanged = function(v) {
	if (v === undefined) {
		this._playerStatus = PlayerStatusNotReady;
	} else if (v === 'ready') {
		this._playerStatus = PlayerStatusReady;
	}

	this._sendOwnStatus(0);	// to all
	this._updatePlayerList(this._playerId, this._playerName, this._playerStatus);
}

LoungeClass.prototype._receivedPlayerMetaData = function(conn, msg) {
	if (this._connPlayers.hasOwnProperty(msg.id)) {	// we already know this player
		this._updatePlayerList(msg.id, msg.name, msg.status);
	} else {	// a new player connected!
		this._p2pComm.sendKnownPeers(msg.id);
		this._sendOwnStatus(msg.id);
		this._addPlayerToList(msg.id, msg.name);
	}
}

LoungeClass.prototype._sendOwnStatus = function(receiverId) {
	this._p2pComm.sendPlayerMetaData(receiverId, this._playerId, this._playerName, this._playerStatus);
}

LoungeClass.prototype._playerConnected = function(peerId) {
	console.log('player connected: ' + peerId);

	this._sendOwnStatus(peerId);
}

LoungeClass.prototype._playerDisconnected = function(peerId) {
	console.log('player disconnected: ' + peerId);

	// remove the player from the list
	var playerNameField = $('#playerlist_id_' + peerId);
	if (this._connPlayers.hasOwnProperty(peerId)) {
		delete this._connPlayers[peerId];
		if (playerNameField) playerNameField.detach();
		// if (Object.keys(this._connPlayers).length === 1) {	// we are the last one in the game
		// 	this._gameId = this._playerId;		// we take over the game id
		// 	$('#game_id').text(this._gameId);
		// 	$('#game_conn_status').text('created');
		// }
	}
}