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
        'lounge.js'
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
    multiplayer: new Array(
        'lib/peer.min.js',
        'server_comm.js',
        'p2p_comm.js'
    )
}

// Main variables
var lounge;
var game;
var gameMode;
var gameId;
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

    gameMode = parseInt(getURLParamByName('mode'));

    var gameIdStr = getURLParamByName('game_id');
    if (gameIdStr === undefined || gameIdStr === '') {
        gameId = 0;
    } else {
        gameId = gameIdStr;
        gameMode = GameModeMultiPlayer; // must be MP!
    }

    if (gameMode == GameModeSinglePlayer) {
        loadLoungePhase2();
    } else {
        // load special MP sources
        loadJsSources(jsIncludes.multiplayer, loadLoungePhase2)
    }
}

/**
 *  This function will really load the game lounge.
 */
function loadLoungePhase2() {
    lounge = new LoungeClass(gameMode);
    lounge.setup(gameId);
}

/**
 *  Load the game itself.
 */
function loadGame() {
    console.log('Loading game...');

    gameMode = parseInt(getURLParamByName('mode'));
    gameId = parseInt(getURLParamByName('game_id'));

    game = new GameClass(gameMode);
    game.setup();
    game.startGame();
}

