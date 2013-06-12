function ViewClass() {
    this._canvas = document.getElementById('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._elems = new Array();
    this._isUpdating = false;

    this.w = this._canvas.width;
    this.h = this._canvas.height;

    this.rows = 0;
    this.cols = 0;
    this.cellW = 0;
    this.cellH = 0;
}

ViewClass.prototype.setup = function(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cellW      = this.w / (this.cols);
    this.cellW_2    = this.cellW / 2;
    this.cellH      = this.h / (this.rows);
    this.cellH_2    = this.cellH / 2;
    console.log('Drawing ' + this.cols + ' x ' + this.rows + ' grid with cells size ' + this.cellW + ' x ' + this.cellH);
}

ViewClass.prototype.addElement = function(elem) {
    this._elems.push(elem);
}

ViewClass.prototype.update = function() {
    if (this._isUpdating === true) return;

    this._isUpdating = true;
    for (var i = 0; i < this._elems.length; i++) {
        this._elems[i].draw();
    }
    this._isUpdating = false;
}

ViewClass.prototype.drawCell = function(x, y, style) {
    this.rect(x * this.cellW, y * this.cellH, this.cellW, this.cellH, style);
}

ViewClass.prototype.drawCellCircle = function(x, y, margin, style) {
    this.circle(x * this.cellW + this.cellW_2, y * this.cellH + this.cellH_2, this.cellW - margin, style);
}

ViewClass.prototype.rect = function(x, y, w, h, style) {
    var ctx = this._ctx;

    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
}

ViewClass.prototype.circle = function(x, y, d, style) {
    var ctx = this._ctx;

    ctx.beginPath();
    ctx.arc(x, y, d / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = style;
    ctx.fill();
}

