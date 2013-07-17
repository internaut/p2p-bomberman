/**
 * P2P-Bomberman map class.
 * Displays a map of cells with different types and properties.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

/**
 * Define colors for different types of maps.
 */
var MapColors = new Object();
MapColors['X'] = 'darkgrey';	// indistructable cell
MapColors['x'] = 'white';		// distructable cell
MapColors[' '] = 'black';		// free cell
// MapColors['U'] = 'red';		
								// additional types: 'B' for bomb
								// 					 'U' for upgrade	(increases bomb strength)

var MapGridColor = 'grey';			// grid line color

/**
 * Define map dimensions.
 */
var MapDimensions = {
	w: 10,
	h: 10
};

/**
 * Define map data with cell types.
 */
var MapData = new Array(
	'X', 'X', 'X', 'X', ' ', 'x', 'x', 'X', 'P', 'x',
	'P', ' ', 'x', ' ', 'X', 'x', 'x', ' ', ' ', 'x',
	'x', ' ', 'X', 'x', 'X', 'X', 'x', 'x', 'x', 'X',
	'X', 'x', 'x', 'x', 'x', 'x', 'x', 'X', 'x', 'X',
	'X', 'X', 'X', 'x', 'X', 'x', 'X', 'x', ' ', 'X',
	'x', 'x', 'X', 'x', 'x', 'X', 'x', 'x', 'x', 'X',
	'x', ' ', 'x', 'x', ' ', 'x', 'x', 'x', 'x', 'x',
	'X', 'x', 'x', 'X', 'x', 'X', 'x', 'X', 'x', 'X',
	'X', 'x', 'x', 'x', 'X', 'x', 'x', 'x', ' ', 'P',
	'P', ' ', ' ', 'X', 'x', 'x', 'x', 'x', ' ', 'X'
);

/**
 * Helper function to return the cell type at map position <x>, <y>.
 */
function mapCellType(x, y) {
	return MapData[y * MapDimensions.w + x];
}

/**
 * Helper function to tell if map position <x>, <y> is traversable.
 */
function mapCellIsFree(x, y) {
	var t = mapCellType(x, y);
	return (t === ' ' || t === 'P' || t === 'U');
}

/**
 * Helper function to set map cell at position <x>, <y> to type <t>.
 */
function mapCellSet(x, y, t) {
	MapData[y * MapDimensions.w + x] = t;
}

/**
 * Inherit from EntityClass.
 */
MapClass.prototype = new EntityClass();
MapClass.constructor = MapClass;

/**
 * MapClass constructor.
 */
function MapClass() {
	var w = MapDimensions.w;
	var h = MapDimensions.h;

	this._p2pComm = null;
	
	// create array of possible spawn points.
	this._spawnPoints = new Array();
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			if (MapData[y * w + x] === 'P') {
				this._spawnPoints.push(new Array(x, y));
			}
		}
	}
}

/**
 * Set the P2PCommClass reference to <p2pCommRef> and set a message handler
 * for receiving upgrade messages.
 */
MapClass.prototype.setP2PComm = function(p2pCommRef) {
	this._p2pComm = p2pCommRef;

	// set a message handler for "upgrade" messages
    this._p2pComm.setMsgHandler(MsgTypePlayerUpgrade,   this, this.receivedUpgradeMsg);
}

/**
 * Return array of spawnpoints
 */
MapClass.prototype.getSpawnPoints = function() {
	return this._spawnPoints;
}

/**
 * Draw the whole map with its cells.
 */
MapClass.prototype.draw = function() {
	var w = MapDimensions.w;
	var h = MapDimensions.h;

	// draw cells
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			// get cell type at cell x, y
			var cellType = MapData[y * w + x];

			if (cellType === 'X' || cellType === 'x') {	// draw "blocking" cell types
				this._view.drawCell(x, y, MapColors[cellType]);
			} else if (cellType === 'U') {				// draw upgrade item
				this._view.drawUpgradeItem(x, y, 10, 'yellow');
			}
		}
	}

	// draw grid horizontally
	for (var y = 0; y < h; y++) {
		var yCoord = y * this._view.cellH;
		this._view.line(0, yCoord, w * this._view.cellW, yCoord, MapGridColor);
	}

	// draw grid vertically
	for (var x = 0; x < w; x++) {
		var xCoord = x * this._view.cellW;
		this._view.line(xCoord, 0, xCoord, h * this._view.cellH, MapGridColor);
	}
}

/**
 * P2P message handler function for receiving a message <msg> from connection <conn>
 * of type MsgTypePlayerUpgrade. It will set a cell type to "upgrade" for the position
 * contained in the message.
 */
MapClass.prototype.receivedUpgradeMsg = function(conn, msg) {
	// set to cell type 'U' (upgrade item) at the submitted position.
	mapCellSet(msg.pos[0], msg.pos[1], 'U');
}
