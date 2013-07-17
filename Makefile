SRCFOLDER = src/js
TMPFOLDER = tmp
CONCATFILE = $(TMPFOLDER)/bomberman.full.js
OUTPUT = $(SRCFOLDER)/bomberman.min.js

FILES = bomberman.js helper.js game.js p2p_comm.js entity.js player.js player_manager.js lounge.js view.js map.js bomb.js controls.js

all: concat compress

concat:
	cd $(SRCFOLDER); cat $(FILES) > ../../$(CONCATFILE)

compress: $(CONCATFILE)
	yuicompressor $(CONCATFILE) -o $(OUTPUT)

clean:
	rm -rf $(TMPFOLDER)/*
