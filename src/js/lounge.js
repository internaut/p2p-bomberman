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
		$('#player_conn_status').text('oops!');
		$('#player_conn_status').removeClass('status_unknown').addClass('not_ok');
	}.bind(this));
}

/**
 * Start the game (depending on game mode).
 */
LoungeClass.prototype._startGame = function() {
	// create the game object
    game = new GameClass(this._gameMode);

    // set up the game depending on game mode
	if (this._gameMode === GameModeSinglePlayer) {
		game.setup(null, null);
	} else {
		game.setup(this._playerManager, this._p2pComm);
	}

	// show/hide elements and start the game
	$('#main > h1').hide();
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
	// create our local player object
	this._ownPlayer = new PlayerClass(PlayerTypeLocalKeyboardArrows);
	var playerId = this._p2pComm.getPeerId();
	var playerName = 'player_' + playerId;
	this._ownPlayer.setId(playerId).setName(playerName);	// set its properties

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
	this._addPlayerToList(playerId, playerName, this._ownPlayer.getColor());
}

LoungeClass.prototype._addPlayerToList = function(id, playerName, playerColor) {
	var playerNameField = $('#playerlist_id_' + id);

	// create a new remote player object
	if (playerColor === null) {	// it must be a remote player
		if (this._playerManager.playerExists(id)) {
			this._playerManager.removePlayer(id);
			if (playerNameField) playerNameField.detach();
		}

		// create a new remote player and set its properties
		var remotePlayer = new PlayerClass(PlayerTypeRemote);
		remotePlayer.setId(id).setName(playerName);
		playerColor = PlayerColors[this._playerManager.getPlayers().length];	// set a color depending on the index
		remotePlayer.setColor(playerColor);	
		this._p2pComm.setMsgHandler(MsgTypePlayerPos, this._ownPlayer, this._ownPlayer.receivePos);	// set a handler p2p event "player position"
		this._playerManager.addPlayer(remotePlayer);	// add it to the player manager
	}

	// create the new element
	var list = $('#playerlist > ul');
	var htmlId = 'playerlist_id_' + id;
	var elem = '<li id="' + htmlId + '" class="not_ok"><span style="background-color:' + playerColor + '">&nbsp;&nbsp;&nbsp;</span>&nbsp;' + playerName + '</li>';
	list.append(elem);
}

LoungeClass.prototype._updatePlayerList = function(id, playerName, status) {
	// update player data in player manager
	this._playerManager.getPlayer(id).setName(playerName).setStatus(status);

	// check everybody's status
	var players = this._playerManager.getPlayers();
	var numReady = 0;
	var numPlayers = players.length;
	for (var i = 0; i < numPlayers; i++) {
		if (players[i].getStatus() === PlayerStatusReady) {
			numReady++;
		}
	}

	if (numReady === numPlayers) {	// everybody's ready!!
		$('#lounge').hide();
		init('game');				// so let's start the game
	}

	// update html
	var elem = $('#playerlist_id_' + id);
	var children = elem.children();
	elem.html('&nbsp;' + playerName).prepend(children);

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
			this._addPlayerToList(msg.id, msg.name, null);
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

	// remove the player from the game
	if (this._playerManager.playerExists(peerId)) {
		if (this._playerManager._map && this._playerManager._map._view) {	// also remove the player from the view!
			this._playerManager._map._view.removeEntity(this._playerManager.getPlayer(peerId));
		}

		// remove the player from the player manager
		this._playerManager.removePlayer(peerId);

		// remove the player from the player list
		var playerNameField = $('#playerlist_id_' + peerId);
		if (playerNameField) playerNameField.detach();
	}
}
