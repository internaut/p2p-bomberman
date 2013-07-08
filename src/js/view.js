/**
 * P2P-Bomberman view core.
 * Handles a set of entities that are displayed on top of each other
 * in a 2D-canvas.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

function ViewClass() {
    this._canvas = document.getElementById('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._entities = new Array();   // array of type EntityClass

    this.w = this._canvas.width;
    this.h = this._canvas.height;

    // number of cells in horizontal and vertical direction
    this.rows = 0;
    this.cols = 0;

    // cell dimensions
    this.cellW = 0;
    this.cellH = 0;
}

/**
 * Sets up a new view with a specified number of cells
 * in horizontal and vertical direction.
 */
ViewClass.prototype.setup = function(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cellW      = this.w / (this.cols);
    this.cellW_2    = this.cellW / 2;
    this.cellH      = this.h / (this.rows);
    this.cellH_2    = this.cellH / 2;

    console.log('Drawing ' + this.cols + ' x ' + this.rows + ' grid with cells size ' + this.cellW + ' x ' + this.cellH);
}

/**
 * Adds a new entity <e> to the view. It will be pushed to the end
 * of the array and will be displayed on top.
 */
ViewClass.prototype.addEntity = function(e) {
    for (var i = 0; i < this._entities.length; i++) {   // check if we already have this entity
        if (this._entities[i] === e) return;
    }

    this._entities.push(e);
}

/**
 * Adds a new entity <e> to the view before the entity <o>. It will displayed beneath
 * entity <o>.
 */
ViewClass.prototype.addEntityBeforeEntity = function(e, o) {
    for (var i = 0; i < this._entities.length; i++) {
        var curE = this._entities[i];
        if (curE === o) {
            this._entities.splice(i, 0, e); // insert it here

            return;
        }
    }

    // if we didn't find 'o', add it to the end:
    this.addEntity(e);
}

/**
 * Removes the entity <e> from the view.
 */
ViewClass.prototype.removeEntity = function(e) {
    for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i] === e) {
            this._entities.splice(i, 1);

            return;
        }
    }
}

/**
 * Updates the view by clearing the canvas and calling the
 * <draw()> function of all entities.
 */
ViewClass.prototype.update = function() {
    this._ctx.clearRect(0, 0, this.w, this.h);

    // call the draw() function of all entities
    for (var i = 0; i < this._entities.length; i++) {
        this._entities[i].draw();
    }
}

/**
 * Function to draw a cell at cell position <x>, <y> with a <style>
 */
ViewClass.prototype.drawCell = function(x, y, style) {
    this.rect(x * this.cellW, y * this.cellH, this.cellW, this.cellH, style);
}

// ViewClass.prototype.drawCell = function(x, y, margin, style) {
//     var w = this.cellW - margin * 2;
//     var h = this.cellH - margin * 2;
//     this.rect(x * this.cellW + margin, y * this.cellH + margin, w, h, style);
// }

ViewClass.prototype.drawUpgradeItem = function(x, y, margin, style) {
    var ctx = this._ctx;

    var l   = this.cellW * x + margin;
    var r   = l + this.cellW - 2 * margin;
    var hM  = l + this.cellW_2 - margin;
    var t   = this.cellH * y + margin;
    var b   = t + this.cellH - 2 * margin;
    var vM  = t + this.cellH_2 - margin;

    ctx.lineWidth = 10.0;
    ctx.strokeStyle = style;

    ctx.beginPath();
    ctx.moveTo(hM, t);
    ctx.lineTo(hM, b);
    ctx.moveTo(l, vM);
    ctx.lineTo(r, vM);
    ctx.stroke();
}

/**
 * Function to draw a cell rhombus at cell position <x>, <y>
 * with a <style> and a <margin>.
 */
ViewClass.prototype.drawCellRhombus = function(x, y, margin, style) {
    var ctx = this._ctx;

    // calculate coordinates
    var l   = this.cellW * x + margin;
    var r   = l + this.cellW - 2 * margin;
    var hM  = l + this.cellW_2 - margin;
    var t   = this.cellH * y + margin;
    var b   = t + this.cellH - 2 * margin;
    var vM  = t + this.cellH_2 - margin;

    // draw its lines
    ctx.beginPath();
    ctx.moveTo(hM, t);
    ctx.lineTo(r, vM);
    ctx.lineTo(hM, b);
    ctx.lineTo(l, vM);
    ctx.closePath();

    // fill it
    ctx.fillStyle = style;
    ctx.fill();

    // ctx.strokeStyle = 'green';
    // ctx.lineWidth = 1.0;
    // ctx.stroke();
}

/**
 * Function to draw a cell circle in to the cell at position <x>, <y>
 * with a <style> and a <margin>.
 */
ViewClass.prototype.drawCellCircle = function(x, y, margin, style) {
    this.circle(x * this.cellW + this.cellW_2, y * this.cellH + this.cellH_2, this.cellW - margin, style);
}

/**
 * Helper function to draw a rectangle.
 */
ViewClass.prototype.rect = function(x, y, w, h, style) {
    var ctx = this._ctx;

    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
}

/**
 * Helper function to draw a circle.
 */
ViewClass.prototype.circle = function(x, y, d, style) {
    var ctx = this._ctx;

    ctx.beginPath();
    ctx.arc(x, y, d / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = style;
    ctx.fill();
}

/**
 * Helper function to draw a line.
 */
ViewClass.prototype.line = function(x1, y1, x2, y2, style) {
    var ctx = this._ctx;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = style;
    ctx.lineWidth = 1.0;
    ctx.stroke();
}
