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
    this._peer      = null;     // peer.js Peer object
    this._conn      = null;
    this._peerId    = '';       // OWN peer id
    this._connected = false;
}

/**
 *  Set up a P2P communication.
 */
P2PCommClass.prototype.setup = function() {

}

/**
 *  Return the peer.js Peer object
 */
P2PCommClass.prototype.getPeer = function() {
    return this._peer;
}

/**
 *  Create a new game. Pass a function <successFn> function(id) that will be called when
 *  we received an Id from the peer.js server and a function <errorFn>.
 */
P2PCommClass.prototype.createGame = function(successFn, errorFn) {
    console.log('Creating a new game...');

    this._createPeer(function(gameId) {
        // call success function
        successFn.call(this, gameId);

        // new peer connection handler
        this._peer.on('connection', function(conn) {
            console.log('received a new connection from ' + conn.peer);
        });
    }.bind(this), errorFn);
}

/**
 *  Join a game with id <gameId>
 */
P2PCommClass.prototype.joinGame = function(gameId, successFn, errorFn) {
    console.log('Trying to join game ' + gameId);

    this._createPeer(function(id) {
        // connect to a peer
        this._conn = this._peer.connect(gameId);

        // success handler
        this._conn.on('open', function() {
            this._connected = true;
            console.log('opened connection to peer ' + this._conn.peer);
            successFn.call(this);
        }.bind(this));

        // error handler
        this._conn.on('error', function(err) {
            this._connected = false;

            defaultErrorFn.call(this, err);
            errorFn.call(this, err);
        }.bind(this));    // watch for errors!

        // new peer connection handler
        this._peer.on('connection', function(conn) {
            console.log('received a new connection from ' + conn.peer);
        });

        // set data receiver function
        this._conn.on('data', function(msg) {
            this._receiverProxy(msg);
        }.bind(this));
    }.bind(this), errorFn);    // watch for errors!
}

P2PCommClass.prototype.sendHello = function(playerId) {
    if (!this._connected) return;

    this._conn.send({hello: playerId});
}

P2PCommClass.prototype._createPeer = function(successFn, errorFn) {
    // create a peer
    this._peer = new Peer({
        host:   Conf.peerJsHost,
        port:   Conf.peerJsPort,
        debug:  Conf.peerJsDebug
    });

    // set the 'open' handler function
    this._peer.on('open', function(pid) {
        console.log('created peer with id ' + pid);

        // set peer id and connection status
        this._peerId = pid;
        this._connected = true;

        // call success function
        successFn.call(this, pid);
    }.bind(this));

    // error handler
    this._peer.on('error', function(err) {
        this._peerId = '';
        this._connected = false;

        defaultErrorFn.call(this, err);
        errorFn.call(this, err);
    }.bind(this));    // watch for errors!
}

P2PCommClass.prototype._receiverProxy = function(msg) {
    if (msg.hello) {
        console.log('received hello from ' + msg.hello);
    }
}