/**
 * P2P-Bomberman P2P communication class.
 * Handles communication with other peer.js clients.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * P2P communication constructor. 
 */
function P2PCommClass() {
    this._peer = null;  // peer.js Peer object
    this._conn = null;

    this._connected = false;
}

/**
 *  Set up a P2P communication. Pass <peer> if we already have a peer.js object
 *  or pass null.
 */
P2PCommClass.prototype.setup = function(peer) {
    this._peer = peer;
}

/**
 *  Join a game with id <gameId>
 */
P2PCommClass.prototype.joinGame = function(gameId, successFn, errorFn) {
    console.log('Trying to join game ' + gameId);

    if (this._peer === null) {
        // create a peer
        this._peer = new Peer({
            host:   Conf.peerJsHost,
            port:   Conf.peerJsPort,
            debug:  Conf.peerJsDebug
        });
    }

    this._peer.on('open', function(id) {
        // connect to a peer
        this._conn = this._peer.connect(gameId);

        // success handler
        this._conn.on('open', function() {
            this._connected = true;
            console.log('opened connection to peer ' + this._conn.peer);
            successFn.call();
        }.bind(this, successFn));

        // error handler
        this._conn.on('error', function(err) {
            defaultErrorFn.call(this, err);
            errorFn.call(this, err);
        }.bind(errorFn));    // watch for errors!
    }.bind(this));

    this._peer.on('error', function(err) {
        defaultErrorFn.call(this, err);
        errorFn.call(this, err);
    }.bind(errorFn));    // watch for errors!
}

/**
 *  Return the peer.js Peer object
 */
P2PCommClass.prototype.getPeer = function() {
    return this._peer;
}