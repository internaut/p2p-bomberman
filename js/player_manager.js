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
    this._players = new Array();    // will hold all players of the game.

    this._map = null;               // ref. to MapClass.
}


/**
 * Set up the player manager class and pass a ref. to MapClass <mapRef>.
 */
PlayerManagerClass.prototype.setup = function(mapRef) {
    this._map = mapRef;
}

/**
 * Return array of all players.
 */
PlayerManagerClass.prototype.getPlayers = function() {
    return this._players;
}

/**
 * Add a new player to the game.
 */
PlayerManagerClass.prototype.addPlayer = function(p) {
    this._players.push(p);
}

/**
 * Remove a player from the game.
 */
PlayerManagerClass.prototype.removePlayer = function(p) {
    for (var i = 0; i < this._players.length; i++) {
        if (this._players[i] === p) {
            this._players.splice(i, 1);

            return true;
        }
    }

    return false;
}

/**
 * Check if the game is over or not.
 */
PlayerManagerClass.prototype.checkGameStatus = function() {
    var numAlive = 0;
    for (var i = 0; i < this._players.length; i++) {
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

    // randomize
    spawnPoints.shuffle();

    // spawn players
    for (var i = 0; i < this._players.length; i++) {
        this.spawnPlayer(this._players[i], spawnPoints[i]);
    }
}

/**
 * Spawn a player <p> on a spawnpoint <spawnPoint>.
 */
PlayerManagerClass.prototype.spawnPlayer = function(p, spawnPoint) {
    p.setAlive(true);

    p.set(spawnPoint[0], spawnPoint[1]);
}