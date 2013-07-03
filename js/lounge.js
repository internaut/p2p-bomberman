/**
 * P2P-Bomberman game lounge class.
 * Handles pre-game management.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

var postGameStartCallback = null;

function LoungeClass(mode) {
	this._gameMode 		= mode;
	this._p2pComm 		= null;
	this._playerManager = null;
	this._ownPlayer		= null;
}

/**
 * Set up the game lounge.
 * If in MP mode, this function requires a <joinId> to join to. If
 * <joinId> is 0, we will create a new MP game.
 */
LoungeClass.prototype.setup = function(joinId) {
	console.log('Setting up lounge in mode ' + this._gameMode + ' and join id ' + joinId);

	postGameStartCallback = {obj: this, fn: this._startGame};

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
		$('#lounge').hide();
		init('game');
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

	// set up player manager
	this._playerManager = new PlayerManagerClass();

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

LoungeClass.prototype._startGame = function() {
    game = new GameClass(this._gameMode);

	if (this._gameMode === GameModeSinglePlayer) {

	} else {

	}

	$('#main > h1').hide();
    game.setup();
    game.startGame();
    $('#game').show();
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
	this._ownPlayer = new PlayerClass(PlayerTypeLocalKeyboardArrows);
	var playerId = this._p2pComm.getPeerId();
	var playerName = 'player_' + playerId;
	this._ownPlayer.setId(playerId).setName(playerName);

	// add our player to the player manager
	this._playerManager.addPlayer(this._ownPlayer);

	// set the form values
	$('#name').val(playerName);
	$('#name').removeAttr('disabled');

	// set the p2p event handlers
	this._p2pComm.setConnEstablishingHandler(this, this._joiningPeer, this._joinedPeer, this._errorJoiningPeer);
	this._p2pComm.setConnOpenedHandler(this, this._playerConnected);
	this._p2pComm.setConnClosedHandler(this, this._playerDisconnected);
	this._p2pComm.setMsgHandler(MsgTypePlayerMetaData, this, this._receivedPlayerMetaData);

	// add our player to the list
	this._addPlayerToList(playerId, playerName, false);
}

LoungeClass.prototype._addPlayerToList = function(id, playerName, isRemotePlayer) {
	var playerNameField = $('#playerlist_id_' + id);

	// create a new remote player object
	if (isRemotePlayer) {
		if (this._playerManager.playerExists(id)) {
			this._playerManager.removePlayer(id);
			if (playerNameField) playerNameField.detach();
		}

		var remotePlayer = new PlayerClass(PlayerTypeRemote);
		remotePlayer.setId(id).setName(playerName);
		this._playerManager.addPlayer(remotePlayer);
	}

	// create the new element
	var list = $('#playerlist > ul');
	var htmlId = 'playerlist_id_' + id;
	var elem = '<li id="' + htmlId + '" class="not_ok">' + playerName + '</li>';
	list.append(elem);
}

LoungeClass.prototype._updatePlayerList = function(id, playerName, status) {
	var elem = $('#playerlist_id_' + id);
	this._playerManager.getPlayer(id).setName(playerName).setStatus(status);

	elem.text(playerName);

	if (status === PlayerStatusNotReady) {
		elem.removeClass('ok').addClass('not_ok');
	} else if (status === PlayerStatusReady) {
		elem.removeClass('not_ok').addClass('ok');
	}
}

LoungeClass.prototype._nameChanged = function(v) {
	this._ownPlayer.setName(v);
	this._sendOwnStatus(0);	// to all
	this._updatePlayerList(this._ownPlayer.getId(), this._ownPlayer.getName(), this._ownPlayer.getStatus());
}

LoungeClass.prototype._statusChanged = function(v) {
	var status = PlayerStatusNotReady;

	if (v === 'ready') {
		status = PlayerStatusReady;
	}
	this._ownPlayer.setStatus(status);
	this._sendOwnStatus(0);	// to all
	this._updatePlayerList(this._ownPlayer.getId(), this._ownPlayer.getName(), this._ownPlayer.getStatus());
}

LoungeClass.prototype._receivedPlayerMetaData = function(conn, msg) {
	if (this._playerManager.playerExists(msg.id)) {	// we already know this player
		this._updatePlayerList(msg.id, msg.name, msg.status);
	} else {	// a new player connected!
		if (this._playerManager.getPlayers().length >= Conf.maxNumPlayers) {	// we already have enough players
			console.log('too many players - closing connection!');
			this._p2pComm.disconnectFromPeer(msg.id);
		} else {	// add this player to the list and send hin some information
			this._p2pComm.sendKnownPeers(msg.id);
			this._sendOwnStatus(msg.id);
			this._addPlayerToList(msg.id, msg.name, true);
		}
	}
}

LoungeClass.prototype._sendOwnStatus = function(receiverId) {
	// console.log('Sending own status: ' + this._ownPlayer + ' to peer ' + receiverId);
	this._p2pComm.sendPlayerMetaData(receiverId, this._ownPlayer.getId(), this._ownPlayer.getName(), this._ownPlayer.getStatus());
}

LoungeClass.prototype._playerConnected = function(peerId) {
	console.log('player connected: ' + peerId);

	this._sendOwnStatus(peerId);
}

LoungeClass.prototype._playerDisconnected = function(peerId) {
	console.log('player disconnected: ' + peerId);

	// remove the player from the list
	var playerNameField = $('#playerlist_id_' + peerId);
	if (this._playerManager.playerExists(peerId)) {
		this._playerManager.removePlayer(peerId);
		if (playerNameField) playerNameField.detach();
	}
}