function playerDeteriorates() {
    if (player.DETERIORATION < PALETTES.deteriorate.length) {
        player.DETERIORATION++;
        updateUIColor(BACKGROUND, PALETTES.deteriorate);
    } else {
        player.BASE_HP--;
        if (player.HP > player.BASE_HP) {
            player.HP = player.BASE_HP;
        }
        player.ATK--;
        player.DEF--;
        drawStatus("You are deteriorating! Losing HP, ATK and DEF.");
    }
}

function playerLeeches() {
    if (player.LEECH < PALETTES.leeching.length) {
        player.LEECH++;
        updateUIColor(TEXT, PALETTES.leeching);
    } else {
        if (random(2) > 0) {
            player.HP = player.HP - 5;
            drawStatus("Your lifeforce is leeching away! Lost 5 HP!");
        }
    }
}

function playerBuffed() {
	player.BASE_HP += Math.ceil(level/POTIONS_EVERY);
    player.BASE_DEF += Math.ceil(level/POTIONS_EVERY);
    player.DEF = player.BASE_DEF;
    player.DETERIORATION = 0;
    if (!player.DETERIORATING) {
        player.DETERIORATING = true;
    }

    drawStatus("Player buffed! Max HP and DEF up!");
    updateUIColor(BACKGROUND, PALETTES.deteriorate);
}

function playerCured() {
	if (player.HP < player.BASE_HP) {
		player.HP = player.BASE_HP;
    }

    player.LEECH = 0;
    updateUIColor(TEXT, PALETTES["leeching"]);
    drawStatus("You feel better! HP restored!");
}

function spawnPlayer() {

	Matrix[PLAYER] = initializeMatrix(ROWS, COLS, "&nbsp");
	
    let acceptablePlacement = false;

    while (!acceptablePlacement) {
	    x = getRandomCoordinate(ROW);
	    y = getRandomCoordinate(COL);
	   
        if (map[x][y] === FLOOR) {
            Matrix[PLAYER][x][y] = PLAYER;
	        player.X = x;
	        player.Y = y;

            acceptablePlacement = true;
        } else {
        }

    }

}
