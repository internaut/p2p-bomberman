/**
 * P2P-Bomberman configuration object.
 *
 * Author: Markus Konrad <post@mkonrad.net>
 */

var Conf = {
	maxNumPlayers: 4,
	maxBombStrength: 5,
	upgradePossibility: 0.25,
	bombTimerMs: 2000,
	moveKeyRepeatTimeMs: 100,
	bombKeyRepeatTimeMs: 500,
	peerJsHost: 'localhost',
	peerJsPort: 9000,
	peerJsDebug: true,
	arrowKeyMapping: new Array(
			'left', 'right',
			'up', 'down',
			'b'
		),
	wsadKeyMapping: new Array(
			'a', 'd',
			'w', 's',
			'x'
		)

};