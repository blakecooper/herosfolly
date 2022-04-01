const BASE_ENEMIES_PER_FLOOR = 4;

const LEFT = 0;
const RIGHT = 1;
const DOWN = 2;
const UP = 3;
const UPLEFT = 4;
const UPRIGHT = 5;
const DOWNLEFT = 6;
const DOWNRIGHT = 7;
const WAIT = 8;

const KEYMAP = {
	"37": LEFT,
	"38": UP,
	"39": RIGHT,
	"40": DOWN,
	"49": DOWNLEFT,
	"50": DOWN,
	"51": DOWNRIGHT,
	"52": LEFT,
	"54": RIGHT,
	"55": UPLEFT,
	"56": UP,
	"57": UPRIGHT,
	"97": DOWNLEFT,
	"98": DOWN,
	"99": DOWNRIGHT,
	"100": LEFT,
	"102": RIGHT,
	"103": UPLEFT,
	"104": UP,
	"105": UPRIGHT,
	"190": WAIT
};

const ROW = 0;
const COL = 1;

const MAP = 0;
const SHARDS = 1;
const MONSTERS = 2;
const PLAYER_MAP = 3;

const POTIONS_EVERY = 5;
 
let level = 0;
let play = true;
let map = "no map loaded";
let player = STATS.Player; 
let keyPressed = -1;

let enemiesMatrix = [];
let shardsMatrix = [];
let playerMatrix = [];
let potionsMatrix = [];

let enemies = [];

function $(e) {
	return document.getElementById(e);
}

function avoidWalls(axis, value) {
	let mapDimension = map.length - 1;

	if (axis == COL) {
		mapDimension = map[0].length - 1;
	}
	
	if (value == 0) { 
		return ++value;
	} else if (value == mapDimension) { 
		return --value;
	} else {
		return value;
	}
}

function blankGrid(matrix) {

	for (let row = 0; row < matrix.length; row++) {
		for (let col = 0; col < matrix[0].length; col++) {
			matrix[row][col] = "&nbsp";
		}
	}
}

function buildLevel() {
	//Pick a random level
	map = LEVELS[random(LEVELS.length)];

	//Wipe slate from previous level
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[0].length; j++) {
			if (map[i][j] !== WALL) {
				map[i][j] = FLOOR;
			}
		}
	}

	blankGrid(potionsMatrix);

	spawnMonsters();

	spawnShards();

	spawnPlayer();

	spawnExit();

	if (level % POTIONS_EVERY === 0) {
		spawnPotion();
	} 

	drawMap();
}

function checkForMonsters(x,y) {
	if (enemiesMatrix[x][y] === MINION || 
		enemiesMatrix[x][y] === MAXION) {
		return true;
	}

	return false;
}

function checkForPotions(x,y) {
	if (level % POTIONS_EVERY === 0 && potionsMatrix[x][y] === POTION) {
		return true;
	}

	return false;
}

function checkForShards(x,y) {
	if (shardsMatrix[x][y] === SHARD) {
		return true;
	}

	return false;
}

function drawMap() {
	
	$("level").innerHTML = "";
	let html = "";

    	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[row].length; col++) {
			html += map[row][col];
		}
		html += "<br>";
	}

    	$("level").innerHTML = html;

	drawMonsters();
	drawShards();
	drawPlayer();

	html = "";

	//force clear potion layer every floor
	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[0].length; col++) {
			html += "&nbsp";
		}
		html += "<br>";
	}

	$("potions").innerHTML = html;
	
	if (level % POTIONS_EVERY === 0) {
		drawPotions();
	}
}

function drawMonsters() {

    	$("monsters").innerHTML = "";
    	let html = "";
   
	//Blank out previous monster data 
	blankGrid(enemiesMatrix);

	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].HP > 0) {
			enemiesMatrix[enemies[i].X][enemies[i].Y] = enemies[i].TYPE;
		}
	}

	for (let row = 0; row < enemiesMatrix.length; row++) {
        for (let col = 0; col < enemiesMatrix[0].length; col++) {
            if (enemiesMatrix[row][col] === MINION || 
                enemiesMatrix[row][col] === MAXION) {
                html += "<span class='background'>";
            }
            
            html += enemiesMatrix[row][col];
            
            if (enemiesMatrix[row][col] !== "&nbsp") {
                html += "</span>";
            }
        }
        html += "<br>";
    }

    $("monsters").innerHTML = html;
}

function drawPotions() {
	$("potions").innerHTML = "";
	let html = "";

	for (let row = 0; row < potionsMatrix.length; row++) {
		for (let col = 0; col < potionsMatrix[0].length; col++) {
			if (potionsMatrix[row][col] === POTION) {
				html += "<span class='background'>";
			}

			html += potionsMatrix[row][col];
			
			if (potionsMatrix[row][col] === POTION) {
				html += "</span>";
			}
		}
		html += "<br>";
	} 
	$("potions").innerHTML = html;
}

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

function drawShards() {
	$("shards").innerHTML = "";
	let html = "";

	for (let row = 0; row < shardsMatrix.length; row++) {
		for (let col = 0; col < shardsMatrix[0].length; col++) {
			if (shardsMatrix[row][col] === SHARD) {
				html += "<span class='background'>";
			}
			
			html += shardsMatrix[row][col];

			if (shardsMatrix[row][col] === SHARD) {
				html += "</span>";
			}
		}

		html += "<br>";
	}

	$("shards").innerHTML = html;
}

function drawStats() {
	$("stats").innerHTML = "Player HP: " 
		+ player.HP
		+ " ATK: "
		+ player.ATK
		+ " DEF: "
		+ player.DEF
		+ " Shards collected: "
		+ player.SHARDS;
}

function drawStatus(message) {
	$("status").innerHTML = message;
}

function enemyAttack(idx) {
	let enemyHit = Math.floor(Math.random() * 20) > player.DEF;
	let dmgToPlayer = enemies[idx].ATK + Math.floor(Math.random() * 2);

	let enemyName = "minion";

	if (enemies[idx].TYPE === MAXION) {
		enemyName = "maxion";
	}
	
	if (enemyHit) {
		player.HP -= dmgToPlayer;
	} else {
		drawStatus("The " + enemyName + " missed!");
	}
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

function fight(enemyIdx) {
	let playerHit = random(20) > enemies[enemyIdx].DEF;
	let dmgToEnemy = player.ATK + random(2);

	if (playerHit) {
		enemies[enemyIdx].HP -= dmgToEnemy;
	} else {
		drawStatus("You missed!");
	}

	if (enemies[enemyIdx].HP < 1) {
		movePlayerTo(enemies[enemyIdx].X, enemies[enemyIdx].Y);
		enemies[enemyIdx].X = -1;
		enemies[enemyIdx].Y = -1;
		drawMonsters();
		player.HP++;
	}

}

async function game() {
	level++;
	buildLevel();
	
	while (play) {
	
		await waitingKeypress();

		if (keyPressed > 0) {
			loop();
		}	
	}	
}

function getEnemyAt(x,y) {
	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].X === x && enemies[i].Y === y) {
			return i;
		}
	}

	return -1;
}

function getRandomCoordinate(axis) {
	let mapLimit = map.length;

	if (axis == COL) {
		mapLimit = map[0].length;
	}

	return avoidWalls(axis, random(mapLimit-1));
}

function loop() {
	
	//Update map and stats
	drawStatus("");
	drawStats();
	drawMap();

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

	//Complete player's move based on what's in the proposed move square
	if (checkForMonsters(proposedPlayerX,proposedPlayerY)) {
		fight(getEnemyAt(proposedPlayerX,proposedPlayerY));
	} else {
		if (checkForShards(proposedPlayerX,proposedPlayerY)) {
			pickupShard();	
			shardsMatrix[proposedPlayerX][proposedPlayerY] = "&nbsp";
			movePlayerTo(proposedPlayerX,proposedPlayerY);
		} else if (checkForPotions(proposedPlayerX,proposedPlayerY)){
			pickupPotion();
			movePlayerTo(proposedPlayerX,proposedPlayerY);
			potionsMatrix[proposedPlayerX][proposedPlayerY] = "&nbsp";
		} else {
			if (map[proposedPlayerX][proposedPlayerY] === WALL) {
			} else if (map[proposedPlayerX][proposedPlayerY] === EXIT) {
			newLevel();
			} else {
				movePlayerTo(proposedPlayerX,proposedPlayerY);
			}
		}
	}

	//After dealing with potential monsters, check again for an exit
	if (map[proposedPlayerX][proposedPlayerY] === EXIT) {
		newLevel();
	};	


	//Check for enemies next to player; those enemies attack, others move toward player
	for (let i = 0; i < enemies.length; i++) {
	
		if ((enemies[i].X > 0 && enemies[i].Y > 0) && (Math.abs(player.X - enemies[i].X) < 2) && (Math.abs(player.Y - enemies[i].Y) < 2)) {
			enemyAttack(i);
		} else {
			if (random(20) > 1) {
				enemyMoves(i);
			}	
		}	
	}
	
	//Check to see if player has died during the loop
	if (player.HP < 1) {
		player.HP = 0;
		drawStats();
		play = false;
		drawStatus("You died.");
	}

}

function movePlayerTo(x,y) {
	playerMatrix[player.X][player.Y] = "&nbsp";
	playerMatrix[x][y] = PLAYER;
	player.X = x;
	player.Y = y;
	drawMap();
}

function moveEnemyTo(idx,x,y) {
	if (enemies[idx].X > 0 && enemies[idx].Y > 0 && map[x][y] === FLOOR && enemiesMatrix[x][y] === "&nbsp") {
		enemiesMatrix[enemies[idx].X][enemies[idx].Y] = "&nbsp";
		if (enemies[idx].TYPE == MINION) {
			enemiesMatrix[x][y] = MINION;
		} else if (enemies[idx].TYPE == MAXION) {
			enemiesMatrix[x][y] = MAXION;
		}
		enemies[idx].X = x;
		enemies[idx].Y = y;
		drawMap(map);
	}
} 

function newLevel() {
	level++;
	buildLevel();
}

function pickupPotion() {
	if (player.HP < STATS.Player.BASE_HP) {
		player.HP = STATS.Player.BASE_HP;
	}
}

function pickupShard() {
	player.SHARDS++;
	player.ATK += level;
}

function random(value) {
	return Math.floor(Math.random() * value);
}

function spawnExit() {

	let acceptableExit = false;
	while (!acceptableExit) {
		let x = getRandomCoordinate(ROW);
		let y = getRandomCoordinate(COL);		

		if (map[x][y] !== PLAYER) {
			map[x][y] = EXIT;		
			acceptableExit = true;
		}
	}
}

function spawnMonsters() {

	enemies = [];
    enemiesMatrix = [];

    let numberEnemies = random(BASE_ENEMIES_PER_FLOOR + (level/3));

	if (numberEnemies === 0) { numberEnemies++; }

	for (let i = 0; i < numberEnemies; i++) {
		let x = getRandomCoordinate(ROW);
		let y = getRandomCoordinate(COL);
		enemies.push({
			"X": x,
			"Y": y,
			"HP": STATS.Minion.HP,
			"ATK": STATS.Minion.ATK,
			"DEF": STATS.Minion.DEF,
			"RESIDUAL_DAMAGE_PENDING": false,
			"TYPE": MINION
		});
	}

	let numberMaxions = random(level/3);

	if (numberMaxions > 0) {
		if (numberMaxions > enemies.length) {
			numberMaxions = enemies.length;
		}

		for (let i = 0; i < numberMaxions; i++) {
			enemies[i].TYPE = MAXION;
			enemies[i].HP = STATS.Maxion.HP;
			enemies[i].ATK = STATS.Maxion.ATK;
			enemies[i].DEF = STATS.Maxion.DEF;
		}
	}

    for (let row = 0; row < map.length; row++) {
        enemiesMatrix.push([]);
        for (let col = 0; col < map[0].length; col++) {
            enemiesMatrix[row][col] = "&nbsp";
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].TYPE === "MINION") {
            enemiesMatrix[enemies[i].X][enemies[i].Y] = MINION;
        } else if (enemies[i].TYPE === "MAXION") {
            enemiesMatrix[enemies[i].X][enemies[i].Y] = MAXION;
        }
    }
}

function spawnPotion() {
	potionsMatrix = [];

	for (let row = 0; row < map.length; row++) {
		potionsMatrix.push([]);
		for (let col = 0; col < map[0].length; col++) {
			potionsMatrix[row][col] = "&nbsp";
		}
	}

	let x = getRandomCoordinate(ROW);
	let y = getRandomCoordinate(COL);
	potionsMatrix[x][y] = POTION;
}

function spawnPlayer() {

	playerMatrix = [];

	for (let row = 0; row < map.length; row++) {
		playerMatrix.push([]);
		for (let col = 0; col < map[0].length; col++) {
			playerMatrix[row][col] = "&nbsp";
		}
	}
	//Draw player
	let x = getRandomCoordinate(ROW);
	let y = getRandomCoordinate(COL);
	playerMatrix[x][y] = PLAYER;
	player.X = x;
	player.Y = y;
}

function spawnShards() {

	shardsMatrix = [];

	
    for (let row = 0; row < map.length; row++) {
        shardsMatrix.push([]);
        for (let col = 0; col < map[0].length; col++) {
            shardsMatrix[row][col] = "&nbsp";
        }
    }
	let numberShards = random(level);
	
	//At least one shard should spawn per level
	if (numberShards == 0) { numberShards = 1 };

	for (let i = 0; i < numberShards; i++) {
		let x = getRandomCoordinate(ROW);
		let y = getRandomCoordinate(COL);
		shardsMatrix[x][y] = SHARD;
	}
}

function waitingKeypress() {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
	for (key in KEYMAP) {
		if (e.keyCode === parseInt(key)) {
        		document.removeEventListener('keydown', onKeyHandler);
			keyPressed = e.keyCode;
        		console.log(KEYMAP[keyPressed]);
			resolve();
		}
      }
    }
  });
}
