var MapColors = new Object();
MapColors['X'] = 'darkgrey';
MapColors['x'] = 'white';
MapColors[' '] = 'black';
MapColors['P'] = 'red';

var MapDimensions = new Object();

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

MapClass.prototype.setup = function(viewRef) {
	this._view = viewRef;
}

MapClass.prototype.draw = function() {
	// draw cells
	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < this.w; x++) {
			this._view.drawCell(x, y, MapColors[this._data[y * this.w + x]]);
		}
	}

	// draw grid
}