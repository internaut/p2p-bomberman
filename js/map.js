var MapColors = new Object();
MapColors['X'] = 'darkgrey';
MapColors['x'] = 'white';
MapColors[' '] = 'black';
MapColors['P'] = 'red';

var GridColor = 'grey';

var MapDimensions = new Object();
MapDimensions.w = 5;
MapDimensions.h = 5;

var MapData = new Array(
	'X', 'X', 'X', 'X', 'P',
	'P', ' ', 'x', ' ', ' ',
	' ', ' ', 'X', 'x', 'X',
	'X', 'x', 'x', ' ', ' ',
	'P', ' ', ' ', 'X', 'P'
);


MapClass.prototype = new EntityClass();
MapClass.constructor = MapClass;

function MapClass() {

}

MapClass.prototype.draw = function() {
	var w = MapDimensions.w;
	var h = MapDimensions.h;

	// draw cells
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var cellType = MapData[y * w + x];
			if (cellType != ' ' && cellType != 'P') {
				this._view.drawCell(x, y, MapColors[cellType]);
			}
		}
	}

	// draw grid
	for (var y = 0; y < h; y++) {
		var yCoord = y * this._view.cellH;
		this._view.line(0, yCoord, w * this._view.cellW, yCoord, GridColor);
	}

	for (var x = 0; x < w; x++) {
		var xCoord = x * this._view.cellW;
		this._view.line(xCoord, 0, xCoord, h * this._view.cellH, GridColor);
	}
}

function mapCellType(x, y) {
	return MapData[y * MapDimensions.w + x];
}

function mapCellIsFree(x, y) {
	var t = mapCellType(x, y);
	return (t === ' ' || t === 'P');
}

function mapCellSet(x, y, t) {
	MapData[y * MapDimensions.w + x] = t;
}