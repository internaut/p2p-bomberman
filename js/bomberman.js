/**
 * P2P-Bomberman main file.
 * Should be included in HTML file. Will load all other sources and
 * start up all stuff.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

// All source files:
var jsIncludes = {
    common: new Array(
        'conf.js',
        'helper.js',
        'game.js'
    ),
    lounge: new Array(

    ),
    game: new Array(
        'view.js',
        'entity.js',
        'map.js',
        'player.js',
        'player_manager.js',
        'bomb.js',
        'controls.js'
    ),
}

// Main variables
var game;
var updateLoop;
var framerate = 60.0;

/**
 * Bomberman initialization. Call this in <body onload=...>.
 * Can load different modules with <module>: 'lounge' or 'game'.
 */
function init(module) {
    console.log('Loading js includes for module ' + module + '...');

    // load common js files
    loadJsSources(jsIncludes.common, null);

    // load special modules
    if (module === 'lounge') {
        loadJsSources(jsIncludes.lounge, loadLounge);
    } else if (module === 'game') {
        loadJsSources(jsIncludes.game, loadGame);
    }
}

/**
 * Load javascript source files from an array <sources>.
 */
function loadJsSources(sources, readyFunc) {
    var head = document.getElementsByTagName('head')[0];

    // load all the sources
    for (var i = 0; i < sources.length; i++) {
        var jsFile = sources[i];
        var script = document.createElement('script');
        var numComplete = 0;
        script.type = 'text/javascript';
        script.src = 'js/' + jsFile;
        console.log('Loading script ' + script.src);

        if (readyFunc !== null) {
            script.onload = function() {
                numComplete++;

                if (numComplete == sources.length) {
                    readyFunc();
                }
            }.bind(readyFunc);
        }

        head.appendChild(script);
    }
}


/**
 *  Load the lounge.
 */
function loadLounge() {
    console.log('Loading lounge...');
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

