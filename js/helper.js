Array.prototype.shuffle = function() {
  var tmp, rand;
  for(var i =0; i < this.length; i++){
    rand = Math.floor(Math.random() * this.length);
    tmp = this[i]; 
    this[i] = this[rand]; 
    this[rand] = tmp;
  }
}

 window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || 
    function(callback) {
          window.setTimeout(callback, 1000 / framerate);
	};
})();


function currentMs() {
    return new Date().getTime();
}