let cookies = document.cookie;

let level = 0;
let highscores = -1;
let isNewHighScore = false;

let map = [];

let Matrix = {
    "m": [],
    "*": [],
    "@": [],
    "%": [],
    "!": []
};

let player = STATS.Player; 
let enemies = [];

let shardsOnLevel = 0;

let keyPressed = -1;
let play = true;
let steps = 0;

let statusQueue = [];

function attack(aggressor, defender) {
    let atkBonus = 0;

    if (aggressor.TYPE === MINION || aggressor.TYPE === MAXION) {
        atkBonus = Math.ceil(level/4);
    } else {
        atkBonus = Math.ceil(aggressor.ATK/5);
    }
    
    let defenderHit = (random(20) + atkBonus) > defender.DEF;

    if (defenderHit) {
        let dmgToDefender = Math.floor(aggressor.ATK/2) + random(Math.ceil(aggressor.ATK/2));
        defender.HP -= dmgToDefender;
        if (defender.HP < 1) {
            let type = defender.TYPE;

            if (type === "M") {
                type = "m";
            }
            Matrix[type][defender.X][defender.Y] = SPACE;
            defender.X = -1;
            defender.Y = -1;

            if (random(2) < 1 && aggressor.HP < aggressor.BASE_HP) {
                aggressor.HP++;
            }

            for (let i = 0; i < defender.SHARDS; i++) {
                pickupShard(aggressor);         
            }

            return false;
        }
    } else {
        if (aggressor === player) {
            drawStatus("You missed!");
        } else if (aggressor.TYPE === MINION) {
            drawStatus("The minion missed!");
        } else if (aggressor.TYP === MAXION) {
            drawStatus("The Maxion missed!");
        }
    }

    return true;
}

function buildLevel() {
	
    initializeAllMatrices();

	map = generateLevel();
	
    spawnExit();

    spawnMonsters();

	spawnPlayer();

    //Get rid of any monsters right next to player
    for (let row = (player.X - 1); row < (player.X + 2); row++) {
        for (let col = (player.Y - 1); col < (player.Y + 2); col++) {
            if (Matrix[MINION][row][col] === MINION || Matrix[MINION][row][col] === MAXION) {
                
                relocateMonsterAtIdx(getEnemyAt(row, col));
            }
        }
    }

	if (level % POTIONS_EVERY === 0) {
		spawnPotion();
	}

    if (random(10) < 1) {
        spawnBuffs();
    } 
	
    spawnShards();
}

function clearShards() {
    player.SHARDS += shardsOnLevel;
    shardsOnLevel = 0;
    Matrix[SHARD] = initializeMatrix(ROWS, COLS, SPACE);
    player.ATK++;
    drawStatus("Level cleared! ATK up!");
}

function enemyMoves(idx) {

	let randomMovementChoice = random(2);
	
	if ((player.X < enemies[idx].X) && (player.Y < enemies[idx].Y)) {
		if (randomMovementChoice === 0) {
			moveEnemyTo(idx, (enemies[idx].X - 1),(enemies[idx].Y));
		} else {
			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y - 1));
		}
	} else if ((player.X < enemies[idx].X) && (player.Y === enemies[idx].Y)) {
		moveEnemyTo(idx, (enemies[idx].X - 1), enemies[idx].Y);
	} else if ((player.X < enemies[idx].X) && (player.Y > enemies[idx].Y)) {
		if (randomMovementChoice === 0) {
			moveEnemyTo(idx, (enemies[idx].X - 1),(enemies[idx].Y));
		} else {
			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y + 1));
		}
	} else if ((player.X === enemies[idx].X) && (player.Y < enemies[idx].Y)) {
		moveEnemyTo(idx, enemies[idx].X, (enemies[idx].Y - 1));
	} else if ((player.X === enemies[idx].X) && (player.Y > enemies[idx].Y)) {
		moveEnemyTo(idx, enemies[idx].X, (enemies[idx].Y + 1));
	} else if ((player.X > enemies[idx].X) && (player.Y < enemies[idx].Y)) {
		if (randomMovementChoice === 0) {
			moveEnemyTo(idx, (enemies[idx].X + 1),(enemies[idx].Y));
		} else {
			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y - 1));
		}
	} else if ((player.X > enemies[idx].X) && (player.Y === enemies[idx].Y)) {
		moveEnemyTo(idx, (enemies[idx].X + 1), enemies[idx].Y);
	} else if ((player.X > enemies[idx].X) && (player.Y > enemies[idx].Y)) {
		if (randomMovementChoice === 0) {
			moveEnemyTo(idx, (enemies[idx].X + 1),(enemies[idx].Y));
		} else {
			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y + 1));
		}
	}
}

async function game() {

    getHighScores();

    checkForMobileDevice();
    
    newLevel();
    
    setInterval(refreshScreen, (1000 / FPS));

	while (play) {
	
		await waitingKeypress();

		if (keyPressed > 0) {
			loop();
		}	
	}

    maybeUpdateHighScores();

    if (isNewHighScore) {
        drawStatus("New high score!");
    }

    clearInterval();
}

function loop() {

    if (player.SHARDS !== 0 &&
        (player.SHARDS + steps) % 777 === 0) {
        randomRegen();
    }

	//Get coordinates of proposed player move
	let proposedPlayerX = player.X;
	let proposedPlayerY = player.Y

	if (KEYMAP[keyPressed] === LEFT) {
		proposedPlayerY--;
	} else if (KEYMAP[keyPressed] === RIGHT) {
		proposedPlayerY++;
	} else if (KEYMAP[keyPressed] === UP) {
		proposedPlayerX--;
	} else if (KEYMAP[keyPressed] === DOWN) {
		proposedPlayerX++;
	} else if (KEYMAP[keyPressed] === DOWNRIGHT) {
		proposedPlayerX++;
		proposedPlayerY++;
	} else if (KEYMAP[keyPressed] === DOWNLEFT) {
		proposedPlayerX++;
		proposedPlayerY--;
	} else if (KEYMAP[keyPressed] === UPRIGHT) {
		proposedPlayerX--;
		proposedPlayerY++;
	} else if (KEYMAP[keyPressed] === UPLEFT) {
		proposedPlayerX--;
		proposedPlayerY--;
	}

    steps++;

    //These conditions need to prevent the player from moving (and also updating the player x and y coordinates incorrectly)
	let monsterPresent = false;
    let moveDownStairs = false;

	//Complete player's move based on what's in the proposed move square
	if (checkForMonsters(proposedPlayerX,proposedPlayerY)) {
		monsterPresent = attack(player, enemies[getEnemyAt(proposedPlayerX,proposedPlayerY)]);
        if (shardsOnLevel > 0 && monstersCleared()) {
            clearShards();
        }
    }

	if (!monsterPresent && checkForShards(proposedPlayerX,proposedPlayerY)) {
		pickupShard(player);	
		Matrix[SHARD][proposedPlayerX][proposedPlayerY] = SPACE;
	}

	if (!monsterPresent && checkForPotions(proposedPlayerX,proposedPlayerY)){
		pickupPotion();
		Matrix[POTION][proposedPlayerX][proposedPlayerY] = SPACE;
	}

    if (!monsterPresent && checkForBuffs(proposedPlayerX, proposedPlayerY)) {
        pickupBuff();
        Matrix[BUFF][proposedPlayerX][proposedPlayerY] = SPACE;
    }

	if (!monsterPresent && map[proposedPlayerX][proposedPlayerY] === EXIT) {
		newLevel();	
        moveDownStairs = true;
    }
	
	if (!monsterPresent && !moveDownStairs && map[proposedPlayerX][proposedPlayerY] !== WALL) {
		movePlayerTo(proposedPlayerX,proposedPlayerY);
	}

	//Check for enemies next to player; those enemies attack, others move toward player
	for (let i = 0; i < enemies.length; i++) {
	
		if ((enemies[i].X > 0 && enemies[i].Y > 0) && (Math.abs(player.X - enemies[i].X) < 2) && (Math.abs(player.Y - enemies[i].Y) < 2)) {
			attack(enemies[i],player);
		} else {
			if (enemies[i].TYPE === MAXION || random(20) > 1) {
				enemyMoves(i);
			}	
		}	
	}
	
	//Check to see if player has died during the loop
	if (player.HP < 1) {
		player.HP = 0;
		play = false;
		drawStatus("You died.");
	}

}

function newLevel() {
	level++;
    buildLevel();
	
    if (player.DETERIORATING) {
        playerDeteriorates();
    }

    if (player.LEECHING) {
        playerLeeches();
    }
}

function pickupBuff() {
    playerBuffed();
    player.DETERIORATING = true;
}

function pickupPotion() {
    playerCured();
    player.LEECHING = true;
}

function pickupShard(entity) {
	entity.SHARDS++;
    shardsOnLevel--;

    if (shardsOnLevel === 0) {
        entity.ATK++;
        if (entity === player) {
            drawStatus("Level cleared! ATK up!");
        }
    }

}

function randomRegen() {
    if (player.HP < player.BASE_HP) {
        player.HP++;
        drawStatus("You feel a benevolent presence! 1 HP gained.");
    }
}

function spawnBuffs() {
    let acceptablePlacement = false;

    while (!acceptablePlacement) {
		let x = getRandomCoordinate(ROWS);
		let y = getRandomCoordinate(COLS);

        if (map[x][y] !== null && map[x][y] === FLOOR) {
            Matrix[BUFF][x][y] = BUFF;
            acceptablePlacement = true;
        }
    }
}

function spawnExit() {
	let acceptableExit = false;
	while (!acceptableExit) {
		let x = getRandomCoordinate(ROWS);
		let y = getRandomCoordinate(COLS);		

        //Exit shouldn't be within 1 of map edge
        if (x < 2) {
            x = 2;
        }

        if (y < 2) {
            y = 2;
        }

		if (map[x][y] !== null && map[x][y] === FLOOR && noEntitiesOnSquare(x,y)) {
            
           
            let numberFloorsNearby = 0;

            for (let row = (x-1); row < (x+2); row++) {
                for (let col = (y-1); col < (y+2); col++) {
                    if ((row !== x || col !== y) && map[row][col] === FLOOR) {
                        numberFloorsNearby++;
                    }
                }
            }

            if (numberFloorsNearby > 5) {
                map[x][y] = EXIT;		
			    acceptableExit = true;
            }
            
		}
	}
}

function spawnMonsters() {

	enemies = [];

    let numberMinions = level % 5;
	let numberMaxions = Math.floor(level/5);

	for (let i = 0; i < numberMinions + numberMaxions; i++) {
		let acceptablePlacement = false;

        while (!acceptablePlacement) {
            let x = getRandomCoordinate(ROWS);
		    let y = getRandomCoordinate(COLS);

            if (map[x][y] === FLOOR) {
                if (enemies.length < numberMinions) {
                    enemies.push(new Minion(
                        MINION_BASE_HP + Math.floor(level/10),
                        MINION_BASE_ATK + Math.floor(level/10),
                        MINION_BASE_DEF + Math.floor(level/10),
                        0,
                        x,
                        y));
                } else {
                    enemies.push(new Maxion(
                        MAXION_BASE_HP + Math.floor(level/10),
                        MAXION_BASE_ATK + Math.floor(level/10),
                        MAXION_BASE_DEF + Math.floor(level/10),
                        0,
                        x,
                        y));
                }
                
                acceptablePlacement = true;
        	}
        }
        
	}
    
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].TYPE === MINION) {
            Matrix[MINION][enemies[i].X][enemies[i].Y] = MINION;
        } else if (enemies[i].TYPE === MAXION) {
            Matrix[MINION][enemies[i].X][enemies[i].Y] = MAXION;
        }
    }
}

function spawnPotion() {

    let acceptablePlacement = false;

    while (!acceptablePlacement) {

	    let x = getRandomCoordinate(ROWS);
	    let y = getRandomCoordinate(COLS);

        if (map[x][y] === FLOOR) {
            Matrix[POTION][x][y] = POTION;
            acceptablePlacement = true;
        }

    }
}

function spawnShards() {
    shardsOnLevel = 0;
    while (shardsOnLevel < SHARDS_PER_LEVEL) {
        let acceptablePlacement = false;

        while (!acceptablePlacement) {
            let x = getRandomCoordinate(ROWS);
		    let y = getRandomCoordinate(COLS);
		    
            if (map[x][y] === FLOOR && Matrix[PLAYER][x][y] === SPACE && Matrix[MINION][x][y] === SPACE && Matrix[POTION][x][y] === SPACE && Matrix[BUFF][x][y] === SPACE) {
                Matrix[SHARD][x][y] = SHARD;
                shardsOnLevel++;
                acceptablePlacement = true;
            }
        }

        //Somehwere there's a bug that causes fewer shards to actually spawn than are counted.
        //This code checks for that and corrects the number of shardsOnLevel
        let actualShards = 0;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (Matrix[SHARD][row][col] === SHARD) {
                    actualShards++;
                }
            }
        }

        if (actualShards !== shardsOnLevel) {
            shardsOnLevel = actualShards;
        }
    }
}
