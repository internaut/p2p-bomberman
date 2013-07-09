/**
 * P2P-Bomberman entity base class.
 * Each visible object that can be attached to the 'ViewClass' must be
 * derived from the 'EntityClass'.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

function EntityClass() {
	// Entity position
    this.x = 0;
    this.y = 0;

    // View reference
    this._view = null;
}

/**
 * Basic setup for an entity. A reference <viewRef> to the ViewClass must
 * be provided.
 */
EntityClass.prototype.setup = function(viewRef) {
    this._view = viewRef;
}

/**
 * Set the position to <x> and <y>.
 */
EntityClass.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Draw the entity. This method must be overwritten.
 */
EntityClass.prototype.draw = function() {
	// override!
}
