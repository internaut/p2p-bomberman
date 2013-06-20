var PlayerTypeLocalKeyboardArrows  = 0;
var PlayerTypeLocalKeyboardWSAD    = 1;
var PlayerTypeLocalAI              = 2;    // not supported yet
var PlayerTypeRemote               = 3;

PlayerClass.prototype = new EntityClass();
PlayerClass.constructor = PlayerClass;
PlayerClass.prototype.parent = EntityClass.prototype;

function PlayerClass(type) {
    this._margin = 5;
    if (type === PlayerTypeLocalKeyboardArrows) {
        this._color = 'green';
    } else if (type === PlayerTypeLocalKeyboardWSAD) {
        this._color = 'blue';
    }
    
    this._alive = true;
    this._type = type;
    this._playerManager = null;

    this.bombStrength = 2;
}

PlayerClass.prototype.setup = function(viewRef, playerManagerRef) {
    this.parent.setup.call(this, viewRef);   // parent call

    this._playerManager = playerManagerRef;
}

PlayerClass.prototype.getType = function() {
    return this._type;
}

PlayerClass.prototype.setType = function(t) {
    this._type = t;
}

PlayerClass.prototype.setAlive = function(v) {
    this._alive = v;
}

PlayerClass.prototype.getAlive = function() {
    return this._alive;
}


PlayerClass.prototype.draw = function() {
    if (this._alive) {
        this._view.drawCellRhombus(this.x, this.y, this._margin, this._color);
    }
}

PlayerClass.prototype.moveBy = function(dX, dY) {
    if (!this._alive) return;

    var destX = this.x + dX;
    var destY = this.y + dY;

    if (destX < 0 || destX >= MapDimensions.w) destX = this.x;
    if (destY < 0 || destY >= MapDimensions.h) destY = this.y;

    if (mapCellIsFree(destX, destY)) {
        this.set(destX, destY);
    }
}

PlayerClass.prototype.dropBomb = function() {
    if (!this._alive) return;

    var bomb = new BombClass();
    bomb.setup(this._view, this._playerManager);
    bomb.dropByPlayer(this);
}