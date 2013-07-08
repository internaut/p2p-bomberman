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
        'game.js',
        'entity.js',
        'player.js',
        'player_manager.js'
    ),
    lounge: new Array(
        'lounge.js'
    ),
    game: new Array(
        'view.js',
        'map.js',
        'bomb.js',
        'controls.js'
    ),
    multiplayer: new Array(
        'lib/peer.min.js',
        'p2p_comm.js'
    )
}

// Main variables
var lounge;
var game;
var gameMode;
var joinId;
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

    var joinIdStr = getURLParamByName('join_id');
    if (joinIdStr === undefined || joinIdStr === '') {
        joinId = 0;
    } else {
        joinId = joinIdStr;
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
    lounge.setup(joinId);
}

/**
 *  Load the game itself.
 */
function loadGame() {
    console.log('Loading game...');

    postGameStartCallback.fn.call(postGameStartCallback.obj);

    // gameMode = parseInt(getURLParamByName('mode'));
    // joinId = parseInt(getURLParamByName('join_id'));
}

