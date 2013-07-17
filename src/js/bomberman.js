/**
 * P2P-Bomberman main file.
 * Handles game start and stuff.

 * Author: Markus Konrad <post@mkonrad.net>
 */


// Main variables
var lounge;             // LoungeClass instance
var game;               // GameClass instance
var gameMode;           // game mode is GameModeSinglePlayer or GameModeMultiPlayer
var joinId;             // the peer id that we join to or "0"
var framerate = 60.0;   // the animation frame rate

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

    // set the main variables gameMode & joinId

    gameMode = parseInt(getURLParamByName('mode'));

    var joinIdStr = getURLParamByName('join_id');
    if (joinIdStr === undefined || joinIdStr === '') {
        joinId = 0;
    } else {
        joinId = joinIdStr;
        gameMode = GameModeMultiPlayer; // must be MP!
    }

    // start the game lounge
    lounge = new LoungeClass(gameMode);
    lounge.setup(joinId);
}

/**
 *  Load the game itself.
 */
function loadGame() {
    console.log('Loading game...');

    postGameStartCallback.fn.call(postGameStartCallback.obj);
}

