PlayerClass.prototype = new EntityClass();
PlayerClass.constructor = PlayerClass;

function PlayerClass() {
    this._margin = 5;
    this._color = 'green';

    this.bombStrength = 2;
}

PlayerClass.prototype.draw = function() {
    this._view.drawCellRhombus(this.x, this.y, this._margin, this._color);
}

PlayerClass.prototype.moveBy = function(dX, dY) {
    var destX = this.x + dX;
    var destY = this.y + dY;

    if (destX < 0 || destX >= MapDimensions.w) destX = this.x;
    if (destY < 0 || destY >= MapDimensions.h) destY = this.y;

    if (mapCellIsFree(destX, destY)) {
        this.set(destX, destY);
    }
}

PlayerClass.prototype.dropBomb = function() {
    var bomb = new BombClass();
    bomb.setup(this._view);
    bomb.dropByPlayer(this);
}