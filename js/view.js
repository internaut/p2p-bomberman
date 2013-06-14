function ViewClass() {
    this._canvas = document.getElementById('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._entities = new Array();

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

ViewClass.prototype.addEntity = function(e) {
    for (var i = 0; i < this._entities.length; i++) {   // check if we already have this entity
        if (this._entities[i] === e) return;
    }

    this._entities.push(e);
}

ViewClass.prototype.addEntityBeforeEntity = function(e, o) {
    for (var i = 0; i < this._entities.length; i++) {
        var curE = this._entities[i];
        if (curE === o) {
            this._entities.splice(i, 0, e);

            return;
        }
    }

    // if we didn't find 'o', add it to the end:
    this.addEntity(e);
}

ViewClass.prototype.removeEntity = function(e) {
    for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i] === e) {
            this._entities.splice(i, 1);

            return;
        }
    }
}

ViewClass.prototype.update = function() {
    this._ctx.clearRect(0, 0, this.w, this.h);

    for (var i = 0; i < this._entities.length; i++) {
        this._entities[i].draw();
    }
}

ViewClass.prototype.drawCell = function(x, y, style) {
    this.rect(x * this.cellW, y * this.cellH, this.cellW, this.cellH, style);
}

// ViewClass.prototype.drawCell = function(x, y, margin, style) {
//     var w = this.cellW - margin * 2;
//     var h = this.cellH - margin * 2;
//     this.rect(x * this.cellW + margin, y * this.cellH + margin, w, h, style);
// }

ViewClass.prototype.drawCellRhombus = function(x, y, margin, style) {
    var ctx = this._ctx;
    var l   = this.cellW * x + margin;
    var r   = l + this.cellW - 2 * margin;
    var hM  = l + this.cellW_2 - margin;
    var t   = this.cellH * y + margin;
    var b   = t + this.cellH - 2 * margin;
    var vM  = t + this.cellW_2 - margin;

    ctx.beginPath();
    ctx.moveTo(hM, t);
    ctx.lineTo(r, vM);
    ctx.lineTo(hM, b);
    ctx.lineTo(l, vM);
    ctx.closePath();

    ctx.fillStyle = style;
    ctx.fill();

    // ctx.strokeStyle = 'green';
    // ctx.lineWidth = 1.0;
    // ctx.stroke();
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

ViewClass.prototype.line = function(x1, y1, x2, y2, style) {
    var ctx = this._ctx;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = style;
    ctx.lineWidth = 1.0;
    ctx.stroke();
}
