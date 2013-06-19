function PlayerManagerClass() {
    this._players = new Array();

    this._map = null;
}

PlayerManagerClass.prototype.setup = function(mapRef) {
    this._map = mapRef;
}

PlayerManagerClass.prototype.getPlayers = function() {
    return this._players;
}

PlayerManagerClass.prototype.addPlayer = function(p) {
    this._players.push(p);
}

PlayerManagerClass.prototype.removePlayer = function(p) {
    for (var i = 0; i < this._players.length; i++) {
        if (this._players[i] === p) {
            this._players.splice(i, 1);

            return true;
        }
    }

    return false;
}

// PlayerManagerClass.prototype.killPlayer = function(p, respawnAfterMs) {
//     if (!p.getAlive()) return;

//     p.setAlive(false);

//     if (respawnAfterMs > 0) {
//         window.setTimeout(function() { this.respawnPlayer(p); }.bind(this), respawnAfterMs);
//     }
// }

PlayerManagerClass.prototype.spawnAllPlayers = function() {
    var spawnPoints = this._map.getSpawnPoints().slice();

    if (spawnPoints.length < this._players.length) {
        console.error('More players than spawn points on this map!');

        return;
    }

    spawnPoints.shuffle();

    for (var i = 0; i < this._players.length; i++) {
        this.spawnPlayer(this._players[i], spawnPoints[i]);
    }
}

PlayerManagerClass.prototype.spawnPlayer = function(p, spawnPoint) {
    p.setAlive(true);

    p.set(spawnPoint[0], spawnPoint[1]);
}