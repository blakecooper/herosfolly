const BASE_MINIONS_PER_FLOOR = 4;

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const WAIT = 190;
 
let level = 0;
let play = true;
let map = "no map loaded";
let player = STATS.Player; 
let keyPressed = -1;

let enemies = [];
let residualDamage = 0;

function $(e) {
	return document.getElementById(e);
}


function drawMap(map) {
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

function buildLevel() {
	//Pick a random level
	map = LEVELS[Math.floor(Math.random()*LEVELS.length)];
	enemies = [];	
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[0].length; j++) {
			if (map[i][j] !== WALL) {
				map[i][j] = FLOOR;
			}
		}
	}
	drawMap(map);

	//Spawn monsters
	let numberMinions = Math.floor(Math.random()*BASE_MINIONS_PER_FLOOR + level);
	let numberMaxions = Math.floor(Math.random()*level);

	for (let i = 0; i < numberMinions; i++) {
		let x = Math.floor(Math.random()*map.length);
		if (x == 0) { x++; };
		if (x == map.length-1) { x-- };
		let y = Math.floor(Math.random()*map[0].length);
		if (y == 0) { y++; };
		if (y == map[0].length-1) { y-- };
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

	for (let i = 0; i < numberMaxions; i++) {
		let x = Math.floor(Math.random()*map.length);
		if (x == 0) { x++; };
		if (x == map.length-1) { x-- };
		let y = Math.floor(Math.random()*map[0].length);
		if (y == 0) { y++; };
		if (y == map[0].length-1) { y-- };
		map[x][y] = MAXION;
		enemies.push({
			"X": x,
			"Y": y,
			"HP": STATS.Maxion.HP,
			"ATK": STATS.Maxion.ATK,
			"DEF": STATS.Maxion.DEF,
			"RESIDUAL_DAMAGE_PENDING": false,
			"TYPE": "MAXION"
		});
	}

	drawMap(map);

	//Draw shards
	let numberShards = Math.floor(Math.random() * level);
	if (numberShards == 0) { numberShards = 1 };
	for (let i = 0; i < numberShards; i++) {
		let x = Math.floor(Math.random()*map.length);
		if (x == 0) { x++; };
		if (x == map.length-1) { x-- };
		let y = Math.floor(Math.random()*map[0].length);
		if (y == 0) { y++; };
		if (y == map[0].length-1) { y-- };
		map[x][y] = SHARD;
	}

	drawMap(map);

	//Draw player
	let x = Math.floor(Math.random()*map.length);
	if (x == 0) { x++; };
	if (x == map.length-1) { x-- };
	let y = Math.floor(Math.random()*map[0].length);
	if (y == 0) { y++; };
	if (y == map[0].length-1) { y-- };
	map[x][y] = PLAYER;
	player.X = x;
	player.Y = y;

	drawMap(map);

	//Drop exit (down stairs)
	let acceptableExit = false;
	while (!acceptableExit) {
		let x = Math.floor(Math.random()*map.length);
		if (x == 0) { x++; };
		if (x == map.length-1) { x-- };
		let y = Math.floor(Math.random()*map[0].length);
		if (y == 0) { y++; };
		if (y == map[0].length-1) { y-- };
	
		if (map[x][y] !== PLAYER) {
			map[x][y] = EXIT;		
			acceptableExit = true;
		}
	}

	drawMap(map);
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
	//Roll initiative
	let playerInit = Math.floor(Math.random() * 20);
	let enemyInit = Math.floor(Math.random() * 20);

	let playerHit = Math.floor(Math.random() * 20) > enemies[enemyIdx].DEF;
	let dmgToEnemy = player.ATK + Math.floor(Math.random() * 2);

//	if (playerInit > enemyInit) {
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
//	} else {
//		if (playerHit) {
//			residualDamage = playerHit;
//			enemies[enemyIdx].RESIDUAL_DAMAGE_PENDING = true;		
//		}
//	}
}

function getEnemyAt(x,y) {
	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].X === x && enemies[i].Y === y) {
			return i;
		}
	}

	return -1;
}

function loop() {
	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].RESIDUAL_DAMAGE_PENDING) {
			enemies[i].HP - residualDamage;

			if (enemies[i].HP < 1) {
				movePlayerTo(enemies[i].X, enemies[i].Y);
				enemies[i].X = -1;
				enemies[i].Y = -1;
				player.HP++;
			}
		}
		
	}
	
	//Update map and stats
	drawStats();
	drawMap(map);

	//Check to see if player has died
	if (player.HP < 1) {
		play = false;
		$("status").innerHTML = "You died.";
	}

	let proposedMove = -1;
	if (keyPressed === LEFT) {
		proposedMove = player.Y - 1;
		if (map[player.X][proposedMove] === WALL) {
		} else if (map[player.X][proposedMove]=== EXIT) {
			level++;
			buildLevel();
		} else if (map[player.X][proposedMove]  === MINION ||
			map[player.X][proposedMove] === MAXION) {
			fight(getEnemyAt(player.X,proposedMove));
		} else if (map[player.X][proposedMove] === SHARD) {
			player.SHARDS++;
			player.ATK += level;
			movePlayerTo(player.X,proposedMove);
		} else {
			movePlayerTo(player.X,proposedMove);
		}
	} else if (keyPressed === RIGHT) {
		proposedMove = player.Y + 1;
		if (map[player.X][proposedMove] === WALL) {
		} else if (map[player.X][proposedMove]=== EXIT) {
			level++;
			buildLevel();
		} else if (map[player.X][proposedMove]  === MINION ||
			map[player.X][proposedMove] === MAXION) {
			fight(getEnemyAt(player.X,proposedMove));
		} else if (map[player.X][proposedMove] === SHARD) {
			player.SHARDS++;
			player.ATK += level;
			movePlayerTo(player.X,proposedMove);
		} else {
			movePlayerTo(player.X,proposedMove);
		}
	} else if (keyPressed === UP) {
		proposedMove = player.X - 1;
		if (map[proposedMove][player.Y] === WALL) {
		} else if (map[proposedMove][player.Y]=== EXIT) {
			level++;
			buildLevel();
		} else if (map[proposedMove][player.Y]  === MINION ||
			map[proposedMove][player.Y] === MAXION) {
			fight(getEnemyAt(proposedMove,player.Y));
		} else if (map[proposedMove][player.Y] === SHARD) {
			player.SHARDS++;
			player.ATK += level;
			movePlayerTo(proposedMove,player.Y);
		} else {
			movePlayerTo(proposedMove,player.Y);
		}
	} else if (keyPressed === DOWN) {
		proposedMove = player.X + 1;
		if (map[proposedMove][player.Y] === WALL) {
		} else if (map[proposedMove][player.Y]=== EXIT) {
			level++;
			buildLevel();
		} else if (map[proposedMove][player.Y]  === MINION ||
			map[proposedMove][player.Y] === MAXION) {
			fight(getEnemyAt(proposedMove,player.Y));
		} else if (map[proposedMove][player.Y] === SHARD) {
			player.SHARDS++;
			player.ATK += level;
			movePlayerTo(proposedMove,player.Y);
		} else {
			movePlayerTo(proposedMove,player.Y);
		}
	}

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
