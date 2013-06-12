function PlayerClass() {
    this.x = 0;
    this.y = 0;
    this._view = null;
    this._margin = 5;
    this._color = 'green';
}

PlayerClass.prototype.setup = function(viewRef) {
    this._view = viewRef;
}

PlayerClass.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
}

PlayerClass.prototype.draw = function() {
    // console.log('Drawing player at ' + this.x + ', ' + this.y);
    this._view.drawCellCircle(this.x, this.y, this._margin, this._color);
}

PlayerClass.prototype.moveTo = function(x, y) {

}

PlayerClass.prototype.moveBy = function(dX, dY) {
    var destX = this.x + dX;
    var destY = this.y + dY;

    if (destX < 0 || destX >= MapDimensions.w) destX = this.x;
    if (destY < 0 || destY >= MapDimensions.h) destY = this.y;

    this.set(destX, destY);

    this._view.update();
}