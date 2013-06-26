/**
 * P2P-Bomberman server communication class.
 * Handles communication with the peer.js server.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Server communication constructor.
 */
function ServerCommClass() {
    this._peer = null;  // peer.js Peer object
}

/**
 * Set up a server communication
 */
ServerCommClass.prototype.setup = function() {
    // nothing to do yet.
}

/**
 *  Create a new game. Pass a function <onIdFn> function(id) that will be called when
 *  we received an Id from the peer.js server.
 */
ServerCommClass.prototype.createGame = function(onIdFn) {
    // create a peer
    this._peer = new Peer({
        host:   Conf.peerJsHost,
        port:   Conf.peerJsPort,
        debug:  Conf.peerJsDebug
    });

    // set the 'open' handler function
    this._peer.on('open', onIdFn);
    this._peer.on('error', defaultErrorFn);    // watch for errors!
}

/**
 *  Return the peer.js Peer object
 */
ServerCommClass.prototype.getPeer = function() {
    return this._peer;
}