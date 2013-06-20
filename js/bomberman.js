/**
 * P2P-Bomberman main file.
 * Should be included in HTML file. Will load all other sources and
 * start up all stuff.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

// All source files:
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

// Main variables
var game;
var updateLoop;
var framerate = 60.0;

/**
 * Bomberman initialization. Call this in <body onload=...>
 */
function init() {
    console.log('Loading js includes...');
    var head = document.getElementsByTagName('head')[0];

    // load all the sources
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
                loadGame();
            }
        }

        head.appendChild(script);
    }
}

/**
 *  Load the game itself.
 */
function loadGame() {
    console.log('Loading game...');

    game = new GameClass(GameModeSinglePlayer);
    game.setup();
    game.startGame();
}