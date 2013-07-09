/**
 * P2P-Bomberman player manager class.
 * Handles all players and can spawn them.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Player manager class constructor.
 */
function PlayerManagerClass() {
    this._localPlayer = null;       // ref. to the only local player instance
    this._players = new Object();   // will hold all players with mapping id -> PlayerClass object

    this._map = null;               // ref. to MapClass.
    this._p2pComm = null;           // ref. to P2PCommClass (for MP only)
    this._chooseSpawnPointTimeoutHndl = null;   // handle for timeout of chooseSpawnPoint function (MP only)
    this._playersSpawned = false;
//    this._leftSpawnPoints = null;   // spawn points that have not been chosen yet by other peers
}


/**
 * Set up the player manager class and pass a ref. to MapClass <mapRef>.
 */
PlayerManagerClass.prototype.setup = function(mapRef, p2pCommRef) {
    this._map       = mapRef;
    this._p2pComm   = p2pCommRef;
}

/**
 * Return array of all players as array.
 */
PlayerManagerClass.prototype.getPlayers = function() {
    var arr = $.map(this._players,function(v){
        return v;
    });

    return arr;
}

/**
 * Return a specific player identified by <playerId>
 */
PlayerManagerClass.prototype.getPlayer = function(playerId) {
    return this._players[playerId];
}

/**
 * Return the local player instance.
 */
PlayerManagerClass.prototype.getLocalPlayer = function() {
    return this._localPlayer;
}

/**
 * Returns true if a player with id <playerId> exists or otherwise false.
 */
PlayerManagerClass.prototype.playerExists = function(playerId) {
    return this._players.hasOwnProperty(playerId);
}

/**
 * Set up all players with a view <viewRef> and the player manager reference.
 */
PlayerManagerClass.prototype.setupPlayers = function(viewRef, p2pCommRef) {
    for (var id in this._players) {
        this._players[id].setup(viewRef, this, p2pCommRef);
    }
}

/**
 * Add a new player to the game.
 */
PlayerManagerClass.prototype.addPlayer = function(p) {
    this._players[p.getId()] = p;

    if (p.getType() === PlayerTypeLocalKeyboardArrows || p.getType() === PlayerTypeLocalKeyboardWSAD) {
        this._localPlayer = p;
    }
}

/**
 * Remove a player with id <playerId> from the game.
 */
PlayerManagerClass.prototype.removePlayer = function(playerId) {
    if (this._players.hasOwnProperty(playerId)) {
        delete this._players[playerId];
    }
}

/**
 * Check if the game is over or not.
 */
PlayerManagerClass.prototype.checkGameStatus = function() {
    var numAlive = 0;
    for (var i in this._players) {
        if (this._players[i].getAlive() === true) numAlive++;
    }

    if (numAlive === 0) {
        game.roundEnded();
    }
}

/**
 * Spawn all players randomly on the map's spawn points.
 */
PlayerManagerClass.prototype.spawnAllPlayers = function() {
    var spawnPoints = this._map.getSpawnPoints().slice();   // get copy of spawnpoints

    // check
    if (spawnPoints.length < this._players.length) {
        console.error('More players than spawn points on this map!');

        return;
    }

    // spawn depending on game mode
    if (gameMode === GameModeSinglePlayer) {
        this._spawnAllPlayersSP(spawnPoints);
    } else {
        this._spawnAllPlayersMP();
    }
}

/**
 * Spawn all players in singleplayer mode.
 */
PlayerManagerClass.prototype._spawnAllPlayersSP = function(spawnPointsCopy) {
    // randomize
    spawnPointsCopy.shuffle();

    // spawn players
    var i = 0;
    for (var id in this._players) {
        this.spawnPlayer(this._players[id], spawnPointsCopy[i++]);
    }
}

/**
 * Spawn all players in multiplayer mode.
 */
PlayerManagerClass.prototype._spawnAllPlayersMP = function() {
    // set handler for incoming spawn point messages
    this._p2pComm.setMsgHandler(MsgTypePlayerSpawnPoint, this, this._spawnPointMsgReceived);

    this._playersSpawned = false;

    // find a random start time for choosing a spawn point
    var randMs = Math.random() * 800 + 200;
    this._chooseSpawnPointTimeoutHndl = window.setTimeout(function() {
        this._chooseSpawnPoints();
    }.bind(this), randMs);
}

PlayerManagerClass.prototype._chooseSpawnPoints = function() {
    if (this._playersSpawned) return;
    this._playersSpawned = true;

    var spawnPointsCopy = this._map.getSpawnPoints().slice();   // get copy of spawnpoints
    spawnPointsCopy.shuffle();

    var i = 0;
    var spawnPointsMap = new Object();
    for (var id in this._players) {
        var sp = spawnPointsCopy[i++];
        spawnPointsMap[id] = sp;
        this._players[id].setSpawnPoint(sp);
    }

    // construct the message
    var msg = {
        id:         this._localPlayer.getId(),
        type:       MsgTypePlayerSpawnPoint,
        spawnPts:   spawnPointsMap
    };

    // send to all peers
    console.log('sending spawn point message to all');
    this._p2pComm.sendAll(msg);
}

PlayerManagerClass.prototype._spawnPointMsgReceived = function(conn, msg) {
    if (this._playersSpawned) return;
    this._playersSpawned = true;

    window.clearTimeout(this._chooseSpawnPointTimeoutHndl); // cancel own spawning now

    console.log('received spawn point message');

    // we received a map of spawn points
    var spawnPointsMap = msg.spawnPts;

    for (var id in spawnPointsMap) {
        console.log('setting player ' + this._players[id].getName() + ' to ' + spawnPointsMap[id][0] + ',' + spawnPointsMap[id][1]);
        this.spawnPlayer(this._players[id], spawnPointsMap[id]);
    }
}

/**
 * Spawn a player <p> on a spawnpoint <spawnPoint>.
 */
PlayerManagerClass.prototype.spawnPlayer = function(p, spawnPoint) {
    p.setAlive(true);
    p.setSpawnPoint(spawnPoint);
}
