var jsIncludes = new Array('map.js', 'view.js', 'player.js', 'controls.js');
var view;

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

    view.setup(map.w, map.h);
    map.setup(view);
    player.setup(view);
    controls.setup(player);

    view.addElement(map);
    view.addElement(player);

    view.update();
}