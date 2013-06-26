/**
 * P2P-Bomberman helper functions.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */


/**
 * Shuffles an array. Original by Ralf Beutler.
 * See http://www.brain4.de/programmierecke/js/arrayShuffle.php.
 */
Array.prototype.shuffle = function() {
  var tmp, rand;
  for(var i =0; i < this.length; i++){
    rand = Math.floor(Math.random() * this.length);
    tmp = this[i]; 
    this[i] = this[rand]; 
    this[rand] = tmp;
  }
}

/**
 * Will return the next animation frame function.
 */
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || 
    function(callback) {
          window.setTimeout(callback, 1000 / framerate);
	};
})();


/**
 *  Returns the current milliseconds.
 */
function currentMs() {
    return new Date().getTime();
}

/**
 *  Return the value  or an url GET parameter <name>.
 *
 *  See: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
 *  Author: DextOr
 */
function getURLParamByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
