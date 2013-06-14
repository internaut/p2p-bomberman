var jsIncludes = new Array('view.js', 'entity.js', 'map.js', 'player.js', 'bomb.js', 'controls.js');
var view;
var updateLoop;
var framerate = 60.0;

function init() {
    console.log('Loading js includes...');
    var head = document.getElementsByTagName('head')[0];

    for (var i = 0; i < jsIncludes.length; i++) {
        var jsFile = jsIncludes[i];
        var script = document.createElement('script');
        var numComplete = 0;
        script.type = 'text/javascript';
        script.src = 'js/' + jsFile;
        console.log('Loading script ' + script.src);

        script.onload = function () {
            numComplete++;
            if (numComplete == jsIncludes.length) {
                loadClasses();
            }
        }

        head.appendChild(script);
    }
}

function loadClasses() {
    console.log('Loading js classes...');
    view = new ViewClass();
    map = new MapClass();
    player = new PlayerClass();
    controls = new ControlsClass();

    view.setup(MapDimensions.w, MapDimensions.h);
    map.setup(view);
    player.setup(view);
    controls.setup(player);

    view.addEntity(map);
    view.addEntity(player);

    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / framerate);
        };
    })();

    frame();
}

function frame() {
    view.update();

    // request new frame
    requestAnimFrame(function() {
        frame();
    });
}

function currentMs() {
    return new Date().getTime();
}