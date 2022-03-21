const BASE_ENEMIES_PER_FLOOR = 4;

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const WAIT = 190;

const ROW = 0;
const COL = 1;
 
let level = 0;
let play = true;
let map = "no map loaded";
let player = STATS.Player; 
let keyPressed = -1;
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

	spawnMonsters();

	spawnShards();

	spawnPlayer();

	spawnExit();

	drawMap(map);
}

function drawMap() {
	//Draw the level
	$("map").innerHTML = "";
	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[row].length; col++) {
			$("map").innerHTML += map[row][col];
		}
		$("map").innerHTML += "<br>";
	}
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
	
	if (enemyHit) {
		player.HP -= dmgToPlayer;
	} else {
		$("status").innerHTML = "The " + enemies[idx].TYPE + " missed!";
	}
}

function fight(enemyIdx) {
	let playerHit = random(20) > enemies[enemyIdx].DEF;
	let dmgToEnemy = player.ATK + random(2);

	if (playerHit) {
		enemies[enemyIdx].HP -= dmgToEnemy;
	} else {
		$("status").innerHTML = "You missed!";
	}

	if (enemies[enemyIdx].HP < 1) {
		movePlayerTo(enemies[enemyIdx].X, enemies[enemyIdx].Y);
		enemies[enemyIdx].X = -1;
		enemies[enemyIdx].Y = -1;
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
	drawMap(map);

	//Check to see if player has died
	if (player.HP < 1) {
		play = false;
		$("status").innerHTML = "You died.";
	}

	//Get coordinates of proposed player move
	let proposedPlayerX = player.X;
	let proposedPlayerY = player.Y

	if (keyPressed === LEFT) {
		proposedPlayerY--;
	} else if (keyPressed === RIGHT) {
		proposedPlayerY++;
	} else if (keyPressed === UP) {
		proposedPlayerX--;
	} else if (keyPressed === DOWN) {
		proposedPlayerX++;
	}

	//Complete player's move based on what's in the proposed move square
	if (map[proposedPlayerX][proposedPlayerY] === WALL) {
	} else if (map[proposedPlayerX][proposedPlayerY] === EXIT) {
		newLevel();
	} else if (map[proposedPlayerX][proposedPlayerY] === MINION ||
		map[proposedPlayerX][proposedPlayerY] === MAXION) {
		fight(getEnemyAt(proposedPlayerX,proposedPlayerY));
	} else if (map[proposedPlayerX][proposedPlayerY] === SHARD) {
		pickupShard();
		movePlayerTo(proposedPlayerX,proposedPlayerY);
	} else {
		movePlayerTo(proposedPlayerX,proposedPlayerY);
	}

	//Check for enemies next to player; those enemies attack, others move toward player
	for (let i = 0; i < enemies.length; i++) {
		if (player.X === enemies[i].X &&
			(player.Y === enemies[i].Y - 1 
				|| player.Y === enemies[i].Y + 1)

		|| player.Y === enemies[i].Y &&
			(player.X === enemies[i].X - 1
				|| player.X === enemies[i].Y + 1)) {
			
			enemyAttack(i);
		} else {
			if (player.X - enemies[i].X > 0) {
				moveEnemyTo(i, enemies[i].X + 1, enemies[i].Y);
			} else if (player.X - enemies[i].X < 0) {
				moveEnemyTo(i, enemies[i].X - 1, enemies[i].Y);
			} else if (player.X - enemies[i].X === 0) {
				if (player.Y - enemies[i].Y > 0) {
					moveEnemyTo(i, enemies[i].X, enemies[i].Y + 1);
				} else if (player.Y - enemies[i].Y < 0) {
					moveEnemyTo(i, enemies[i].X, enemies[i].Y - 1);
				}
			}
		}	
	}
}

function movePlayerTo(x,y) {
	map[player.X][player.Y] = FLOOR;
	map[x][y] = PLAYER;
	player.X = x;
	player.Y = y;
	drawMap(map);
}

function moveEnemyTo(idx,x,y) {
	if (enemies[idx].X > 0 && enemies[idx].Y > 0 && map[x][y] === FLOOR) {
		map[enemies[idx].X][enemies[idx].Y] = FLOOR;
		if (enemies[idx].TYPE == "MINION") {
			map[x][y] = MINION;
		} else {
			map[x][y] = MAXION;
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

	let numberEnemies = random(BASE_ENEMIES_PER_FLOOR + level);

	if (numberEnemies === 0) { numberEnemies++; }

	for (let i = 0; i < numberEnemies; i++) {
		let x = getRandomCoordinate(ROW);
		let y = getRandomCoordinate(COL);
		map[x][y] = MINION;
		enemies.push({
			"X": x,
			"Y": y,
			"HP": STATS.Minion.HP,
			"ATK": STATS.Minion.ATK,
			"DEF": STATS.Minion.DEF,
			"RESIDUAL_DAMAGE_PENDING": false,
			"TYPE": "MINION"
		});
	}

	let numberMaxions = random(level/3);

	if (numberMaxions > 0) {
		if (numberMaxions > enemies.length) {
			numberMaxions = enemies.length;
		}

		for (let i = 0; i < numberMaxions; i++) {
			enemies[i].TYPE = "MAXION";
			enemies[i].HP = STATS.Maxion.HP;
			enemies[i].ATK = STATS.Maxion.ATK;
			enemies[i].DEF = STATS.Maxion.DEF;
		}
	}
}

function spawnPlayer() {
	//Draw player
	let x = getRandomCoordinate(ROW);
	let y = getRandomCoordinate(COL);
	map[x][y] = PLAYER;
	player.X = x;
	player.Y = y;
}

function spawnShards() {

	let numberShards = random(level);
	
	//At least one shard should spawn per level
	if (numberShards == 0) { numberShards = 1 };

	for (let i = 0; i < numberShards; i++) {
		let x = getRandomCoordinate(ROW);
		let y = getRandomCoordinate(COL);
		map[x][y] = SHARD;
	}
}
	
function waitingKeypress() {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
      if (e.keyCode === LEFT ||
		e.keyCode === RIGHT ||
		e.keyCode === UP ||
		e.keyCode === DOWN ||
		e.keyCode === WAIT) {
        	document.removeEventListener('keydown', onKeyHandler);
		keyPressed = e.keyCode;
        	resolve();
      }
    }
  });
}
