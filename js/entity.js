function EntityClass() {
    this.x = 0;
    this.y = 0;
    this._view = null;
}

EntityClass.prototype.setup = function(viewRef) {
    this._view = viewRef;
}

EntityClass.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
}

EntityClass.prototype.draw = function() {
	// override!
}