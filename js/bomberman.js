var jsIncludes = new Array(
    'helper.js',
    'game.js',
    'view.js',
    'entity.js',
    'map.js',
    'player.js',
    'player_manager.js',
    'bomb.js',
    'controls.js'
);

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
            console.log('numComplete ' + numComplete + ' / ' + jsIncludes.length);
            if (numComplete == jsIncludes.length) {
                loadGame();
            }
        }

        head.appendChild(script);
    }
}

function loadGame() {
    console.log('Loading game...');

    game = new GameClass(GameModeSinglePlayer);
    game.setup();
    game.startGame();
}