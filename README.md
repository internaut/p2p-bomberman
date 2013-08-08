# Peer-to-Peer Bomberman Game

## Introduction

This is an implementation of the popular bomberman game for browsers using HTML5. The interesting thing is, that it uses most recent WebRTC technology to allow playing multiplayer games via a direct peer to peer (i.e. browser to browser) communication.

## Demonstration

You can try out the game on a [demostration server](http://demo.hello-it.eu/p2p/src/). Just create a new multiplayer game and let other players connect to you, using your *PlayerID*. Of course you can also connect to yourself in a new browser window. Up to 4 players can play in one game.

*Please note:* This is just a showcase. The software contains some bugs as well as WebRTC itself is not fully implemented in the browsers and a lot a features are missing. For example, Firefox and Chrome can still not talk to each other via a `RTCDataChannel`.

## Documentation

A comprehensive documentation can be found in the [Wiki](https://github.com/internaut/p2p-bomberman/wiki). The source code itself is also well documented.

There are also some [slides](https://github.com/internaut/p2p-bomberman/raw/master/_docs/webrtc-mkonrad.pdf) of a presentation that I gave about WebRTC in general and this project as an practical example.

## Setting up a game on your own server

*This needs to be added.*

## License

This software is released under a custom BSD 3-clause license which is contained in the file `LICENSE`.
