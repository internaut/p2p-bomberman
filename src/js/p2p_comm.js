/**
 * P2P-Bomberman P2P communication class.
 * Handles communication with other peer.js clients.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Define message types for message handlers.
 */
var MsgTypeKnownPeers       = 0;
var MsgTypePlayerMetaData   = 1;
var MsgTypePlayerPos        = 2;
var MsgTypePlayerSpawnPoint = 3;
var MsgTypePlayerBomb       = 4;
var MsgTypePlayerUpgrade    = 5;

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
    // set default message handlers:
    // callback for receiving a message with known peers
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
        // call the default and the custom error function

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
 *  Join a peer with id <peerId>.
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

/**
 * Disconnect from a peer with id <peerId>.
 */
P2PCommClass.prototype.disconnectFromPeer = function(peerId) {
    console.log('closing connection to peer ' + peerId);
    this._conn[peerId].peerjs.close();
}

/**
 * Will set a message handler callback function <cbFn> (on object <cbObj>)
 * for message <type>. When <add> is true, you can add multiple callbacks
 * for each <type>. 
 *
 * The callback function must handle two parameters: PeerConnection and a
 * message object.
 */
P2PCommClass.prototype.setMsgHandler = function(type, cbObj, cbFn, add) {
    add = (typeof add === 'undefined') ? false : add;

    // define the handle object consisting of a function and the object
    // on which is function is called
    var newHndl = {fn: cbFn, obj: cbObj};

    if (add) {  // add a new handler for this type
        console.log('adding msg handler for type ' + type);

        // convert to array if we don't have an array yet
        if (this._msgHandler[type] instanceof Array === false) {
            var oldHndl = null;
            if (typeof this._msgHandler[type] !== 'undefined') {
                oldHndl = this._msgHandler[type];
            }

            this._msgHandler[type] = new Array();
            
            if (oldHndl) {  // there was already a handler which was not an array
                this._msgHandler[type].push(oldHndl);   // add this handler
            }
        }

        // add the new handler
        this._msgHandler[type].push(newHndl);
    } else {    // just set the handler for this type, possibly dismissing a previews callback
        this._msgHandler[type] = newHndl;
    }
}

/**
 * Set a handlers for connection establish events on <cbObj>:
 * * while joining: <cbFnJoining>
 * * after successful joining: <cbFnJoined>
 * * while joining failure: <cbFnError>
 *
 * The callback function must accept one parameter: peer id
 */
P2PCommClass.prototype.setConnEstablishingHandler = function(cbObj, cbFnJoining, cbFnJoined, cbFnError) {
    this._connEstablishingHandler.push({obj: cbObj, fn: cbFnJoining});
    this._connEstablishingHandler.push({obj: cbObj, fn: cbFnJoined});
    this._connEstablishingHandler.push({obj: cbObj, fn: cbFnError});
}

/**
 * Sets a handler function <cbFn> on object <cbObj> for
 * connection opened (another peer connected) event.
 *
 * The callback function must accept one parameter: peer id
 */
P2PCommClass.prototype.setConnOpenedHandler = function(cbObj, cbFn) {
    this._connOpenedHandler.obj = cbObj;
    this._connOpenedHandler.fn  = cbFn;
}

/**
 * Sets a handler function <cbFn> on object <cbObj> for
 * connection closed (another peer disconnected) event.
 *
 * The callback function must accept one parameter: peer id
 */
P2PCommClass.prototype.setConnClosedHandler = function(cbObj, cbFn) {
    this._connClosedHandler.obj = cbObj;
    this._connClosedHandler.fn  = cbFn;
}

/**
 * Send player meta data (message of type MsgTypePlayerMetaData) to <receivedId>:
 * * player id <pl_id>
 * * player name <pl_name>
 * * player status <pl_status>
 *
 * If <receivedId> is 0 it will be send to all known peers (except self of course).
 */
P2PCommClass.prototype.sendPlayerMetaData = function(receiverId, pl_id, pl_name, pl_status) {
    // construct the message
    var msg = {
        type:   MsgTypePlayerMetaData,
        id:     pl_id,
        name:   pl_name,
        status: pl_status
    };

    if (receiverId === 0) { // send to all
        this.sendAll(msg);
    } else {    // send to specific peer id
        this.sendTo(receiverId, msg);
    }
}

/**
 * Send a message <msg> to all known peers (except self of course).
 */
P2PCommClass.prototype.sendAll = function(msg) {
    console.log('sending message of type ' + msg.type + ' to all');
    for (var peerId in this._conn) {
        var c = this._conn[peerId].peerjs;
        c.send(msg);
    }
}

/**
 * Send a message <msg> to a peer with id <receiverId>.
 */
P2PCommClass.prototype.sendTo = function(receiverId, msg) {
    console.log('sending message of type ' + msg.type + ' to peer ' + receiverId);
    this._conn[receiverId].peerjs.send(msg);
}

/**
 * Send the peer ids of all known peers (except self) to another peer with id <pid>.
 * This will send a message of type MsgTypeKnownPeers.
 */
P2PCommClass.prototype.sendKnownPeers = function(pid) {
    // create an array with all known peer ids (except self)
    var knownPeers = new Array();
    for (var peerId in this._conn) {
        knownPeers.push(peerId);
    }

    console.log('sending known peers to peer ' + pid);

    // send the message of type MsgTypeKnownPeers.
    this.sendTo(pid, {type: MsgTypeKnownPeers, peers: knownPeers});
}

/**
 * Callback function for an "incoming connection" event. Receives
 * a PeerConnection <conn> and will set up the basic connection handlers
 * for this new connection.
 */
P2PCommClass.prototype._incomingConnection = function(conn) {
    if (conn.peer === undefined) return;

    console.log('received new connection from ' + conn.peer);

    // set up the basic connection handlers
    this._setupConnectionHandlers(conn);
}

/**
 * Message handler for message of type MsgTypeKnownPeers. When this message
 * <msg> is received via connection <conn> with an array of peer ids, we will
 * check if we are already connected to these peers and if not, we will
 * connect to them, building a P2P mesh.
 */
P2PCommClass.prototype._receiveKnownPeers = function(conn, msg) {
    console.log('received known peers from peer ' + conn.peer);

    // go through the array of peer ids
    for (var i = 0; i < msg.peers.length; i++) {
        // get the peer id
        var receivedPeerId = msg.peers[i];
        if (receivedPeerId === this._peerId) continue; // dismiss our own id

        console.log('> ' + receivedPeerId);

        // check if we are already connected to this peer
        if (!this._conn.hasOwnProperty(receivedPeerId)) {
            console.log('>> new! Connecting...');

            // connect to this peer
            this.joinPeer(receivedPeerId);
        }
    }
}

/**
 * Set up connection event handlers for a connection <conn>.
 */
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

    // connection closed handler
    conn.on('close', function(peerId) {
        console.log('connection closed from peer ' + peerId);
        this._connClosedHandler.fn.call(this._connClosedHandler.obj, peerId);
    }.bind(this, conn.peer));
}

/**
 * Handler for incoming message <msg> from a peer with connection <conn>.
 */
P2PCommClass.prototype._incomingData = function(conn, msg) {
    if (!msg || !msg.hasOwnProperty('type')) return;    // it must be a valid message with a type

    console.log('received data from ' + conn.peer + ' with type ' + msg.type);

    // get the handler(s) for this type
    var hndl = this._msgHandler[msg.type];

    // we have a handler
    if (hndl) {
        if (hndl instanceof Array === true) {       // the handler is an array of handlers
            for (var i = 0; i < hndl.length; i++) { // call each of these handlers
                hndl[i].fn.call(hndl[i].obj, conn, msg);    // call the handler functon hndl.fn on object hndl.obj with parameter msg
            }
        } else {
            hndl.fn.call(hndl.obj, conn, msg);    // call the handler functon hndl.fn on object hndl.obj with parameter msg
        }
    } else {    // there is no handler for this type
        console.err('no msg handler for type ' + msg.type);
    }
}
