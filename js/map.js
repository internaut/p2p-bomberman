var MapColors = new Object();
MapColors['X'] = 'darkgrey';
MapColors['x'] = 'white';
MapColors[' '] = 'black';
MapColors['P'] = 'red';

var GridColor = 'grey';

var MapDimensions = new Object();

MapClass.prototype = new EntityClass();
MapClass.constructor = MapClass;

function MapClass() {
	this.w = 5;
	this.h = 5;
	MapDimensions.w = this.w;
	MapDimensions.h = this.h;

	this._data = new Array(
		'X', 'X', 'X', 'X', 'P',
		'P', ' ', 'x', ' ', ' ',
		' ', ' ', 'x', 'x', 'X',
		'X', 'x', 'x', ' ', ' ',
		'P', ' ', ' ', 'X', 'P'
	);
}

MapClass.prototype.draw = function() {
	// draw cells
	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < this.w; x++) {
			var cellType = this._data[y * this.w + x];
			if (cellType != ' ') {
				this._view.drawCell(x, y, MapColors[cellType]);
			}
		}
	}

	// draw grid
	for (var y = 0; y < this.h; y++) {
		var yCoord = y * this._view.cellH;
		this._view.line(0, yCoord, this._view.w, yCoord, GridColor);
	}

	for (var x = 0; x < this.w; x++) {
		var xCoord = x * this._view.cellW;
		this._view.line(xCoord, 0, xCoord, this._view.h, GridColor);
	}
}