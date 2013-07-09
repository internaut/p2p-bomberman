/**
 * P2P-Bomberman main file.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */


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
    // load special modules
    if (module === 'lounge') {
        loadLounge();
    } else if (module === 'game') {
        loadGame();
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

