/**
 * P2P-Bomberman P2P communication class.
 * Handles communication with other peer.js clients.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

var MsgTypeKnownPeers       = 0;
var MsgTypePlayerMetaData   = 1;

/**
 * P2P communication constructor. 
 */
function P2PCommClass() {
    this._peer          = null;     // peer.js Peer object
    this._conn          = null;     // shortcut to this._peer.connections
    this._peerId        = '';       // OWN peer id
    this._msgHandler    = new Object(); // message handler with mapping msg type -> {obj, fn}
    this._connEstablishingHandler = new Array();
    this._connOpenedHandler = {obj: null, fn: null};
    this._connClosedHandler = {obj: null, fn: null};
}

/**
 *  Set up a P2P communication.
 */
P2PCommClass.prototype.setup = function() {
    // set default message handlers
    this.setMsgHandler(MsgTypeKnownPeers, this, this._receiveKnownPeers);
}

/**
 *  Return the peer.js Peer object
 */
P2PCommClass.prototype.getPeer = function() {
    return this._peer;
}

/**
 *  Return the peer id
 */
P2PCommClass.prototype.getPeerId = function() {
    return this._peerId;
}

/**
 *  Create a new peer. Pass a function <successFn> function(id) that will be called when
 *  we received an Id from the peer.js server and a function <errorFn>.
 */
P2PCommClass.prototype.createPeer = function(successFn, errorFn) {
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

        // call success function
        successFn.call(this, pid);
    }.bind(this));

    // error handler
    this._peer.on('error', function(err) {
        this._peerId = '';

        defaultErrorFn.call(this, err);
        errorFn.call(this, err);
    }.bind(this));    // watch for errors!

    // new peer connection handler for incoming connections
    this._peer.on('connection', function(conn) {
        this._incomingConnection(conn);
    }.bind(this));

    // connection to peer server is closed
    this._peer.on('close', function() {
        console.log('connection to peer server closed');
    }.bind(this));

    // set shortcut
    this._conn = this._peer.connections;
}

/**
 *  Join a peer with id <peerId>
 */
P2PCommClass.prototype.joinPeer = function(peerId) {
    console.log('trying to join peer ' + peerId);

    // callback#1: joining
    var cbJoining = this._connEstablishingHandler[0];
    cbJoining.fn.call(cbJoining.obj, peerId);

    // connect to a peer
    var conn = this._peer.connect(peerId);

    // success handler for outgoing connection
    conn.on('open', function() {
        console.log('opened connection to peer ' + conn.peer);

        // callback#2: joined
        var cbJoined = this._connEstablishingHandler[1];
        cbJoined.fn.call(cbJoined.obj, conn.peer);
    }.bind(this));

    // error handler
    conn.on('error', function(err) {
        defaultErrorFn.call(this, err);
        
        // callback#3: joined
        var cbErr = this._connEstablishingHandler[2];
        cbErr.fn.call(cbErr.obj);
    }.bind(this));    // watch for errors!

    // set data receiver function
    this._setupConnectionHandlers(conn);
}

P2PCommClass.prototype.setMsgHandler = function(type, cbObj, cbFn) {
    this._msgHandler[type] = {fn: cbFn, obj: cbObj};
}

P2PCommClass.prototype.setConnEstablishingHandler = function(cbObj, cbFnJoining, cbFnJoined, cbFnError) {
    this._connEstablishingHandler.push({obj: cbObj, fn: cbFnJoining});
    this._connEstablishingHandler.push({obj: cbObj, fn: cbFnJoined});
    this._connEstablishingHandler.push({obj: cbObj, fn: cbFnError});
}

P2PCommClass.prototype.setConnOpenedHandler = function(cbObj, cbFn) {
    this._connOpenedHandler.obj = cbObj;
    this._connOpenedHandler.fn  = cbFn;
}

P2PCommClass.prototype.setConnClosedHandler = function(cbObj, cbFn) {
    this._connClosedHandler.obj = cbObj;
    this._connClosedHandler.fn  = cbFn;
}

P2PCommClass.prototype.sendPlayerMetaData = function(receiverId, pl_id, pl_name, pl_status) {
    var msg = {
        type:   MsgTypePlayerMetaData,
        id:     pl_id,
        name:   pl_name,
        status: pl_status
    };

    if (receiverId === 0) {
        this.sendAll(msg);
    } else {
        this.sendTo(receiverId, msg);
    }
}

P2PCommClass.prototype.sendAll = function(msg) {
    console.log('sending message of type ' + msg.type + ' to all');
    for (var peerId in this._conn) {
        var c = this._conn[peerId].peerjs;
        c.send(msg);
    }
}

P2PCommClass.prototype.sendTo = function(receiverId, msg) {
    this._conn[receiverId].peerjs.send(msg);
}

P2PCommClass.prototype.sendKnownPeers = function(pid) {
    var knownPeers = new Array();
    for (var peerId in this._conn) {
        knownPeers.push(peerId);
    }

    console.log('sending known peers to peer ' + pid);

    this.sendTo(pid, {type: MsgTypeKnownPeers, peers: knownPeers});
}

P2PCommClass.prototype._incomingConnection = function(conn) {
    if (conn.peer === undefined) return;

    console.log('received new connection from ' + conn.peer);

    this._setupConnectionHandlers(conn);
}

P2PCommClass.prototype._receiveKnownPeers = function(conn, msg) {
    console.log('received known peers from peer ' + conn.peer);

    for (var i = 0; i < msg.peers.length; i++) {
        var receivedPeerId = msg.peers[i];
        if (receivedPeerId === this._peerId) continue;

        console.log('> ' + receivedPeerId);

        if (!this._conn.hasOwnProperty(receivedPeerId)) {
            console.log('>> new! Connecting...');

            // connect to a peer
            this.joinPeer(receivedPeerId);

            // set data receiver function
            this._setupConnectionHandlers(conn);
        }
    }
}

P2PCommClass.prototype._setupConnectionHandlers = function(conn) {
    // success handler for outgoing connection
    conn.on('open', function() {
        console.log('opened connection to peer ' + conn.peer);
        this._connOpenedHandler.fn.call(this._connOpenedHandler.obj, conn.peer);
    }.bind(this));

    // error handler
    conn.on('error', function(err) {
        defaultErrorFn.call(this, err);
    }.bind(this));    // watch for errors!

    // set data receiver function
    conn.on('data', function(msg) {
        this._incomingData(conn, msg);
    }.bind(this));

    conn.on('close', function(peerId) {
        console.log('connection closed from peer ' + peerId);
        this._connClosedHandler.fn.call(this._connClosedHandler.obj, peerId);
    }.bind(this, conn.peer));
}

P2PCommClass.prototype._incomingData = function(conn, msg) {
    if (!msg || !msg.hasOwnProperty('type')) return;

    console.log('received data from ' + conn.peer + ' with type ' + msg.type);

    var hndl = this._msgHandler[msg.type];

    if (hndl) {
        hndl.fn.call(hndl.obj, conn, msg);    // call the handler functon hndl.fn on object hndl.obj with parameter msg
    } else {
        console.err('no msg handler for type ' + msg.type);
    }
}