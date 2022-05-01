function drawPlayer() {
	$("player").innerHTML = "";
	let html = "";

	for (let row = 0; row < playerMatrix.length; row++) {
		for (let col = 0; col < playerMatrix[0].length; col++) {
			if (playerMatrix[row][col] === PLAYER) {
				html += "<span class='background'>";
			}

			html += playerMatrix[row][col];

			if (playerMatrix[row][col] === PLAYER) {
				html += "</span>";
			}
		}
		html += "<br>";
	}
	$("player").innerHTML = html;
}

function playerDeteriorates() {
    player.DETERIORATION++;

    if ((player.DETERIORATION - 1) > -1 && player.DETERIORATION > 9) {
        if (player.DETERIORATION - 10 < deteriorationDamage.length) {
            player.HP -= deteriorationDamage[player.DETERIORATION - 10];
        } else {
            player.HP -= deteriorationDamage[deteriorationDamage.length - 1];
        }
    
        drawStatus("You feel sick!");
    }

    updateUIColor(PALETTES.deteriorate);
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
    updateUIColor(PALETTES.deteriorate);
}

function playerCured() {
	if (player.HP < player.BASE_HP) {
		player.HP = player.BASE_HP;
    }

    drawStatus("You feel better! HP restored!");
}

function spawnPlayer() {

    blankGrid(playerMatrix);
	playerMatrix = initializeMatrix(map.length, map[0].length, "&nbsp");
	
    let acceptablePlacement = false;

    while (!acceptablePlacement) {
	    x = getRandomCoordinate(ROW);
	    y = getRandomCoordinate(COL);
	   
        if (map[x][y] === FLOOR) {
            playerMatrix[x][y] = PLAYER;
	        player.X = x;
	        player.Y = y;

            acceptablePlacement = true;
        } else {
        }

    }

    drawPlayer();
}
