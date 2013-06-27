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
 *  Create a new game. Pass a function <successFn> function(id) that will be called when
 *  we received an Id from the peer.js server and a function <errorFn>.
 */
ServerCommClass.prototype.createGame = function(successFn, errorFn) {
    // create a peer
    this._peer = new Peer({
        host:   Conf.peerJsHost,
        port:   Conf.peerJsPort,
        debug:  Conf.peerJsDebug
    });

    // set the 'open' handler function
    this._peer.on('open', successFn);

    // error handler
    this._peer.on('error', function(err) {
        defaultErrorFn.call(this, err);
        errorFn.call(this, err);
    }.bind(errorFn));    // watch for errors!
}

/**
 *  Return the peer.js Peer object
 */
ServerCommClass.prototype.getPeer = function() {
    return this._peer;
}