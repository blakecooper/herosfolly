let bodyBackground = 'black';

function closeSpan() {
    if (player.HP < player.BASE_HP) {
        return "</span>";
    } else {
        return "";
    }
}

function damageSpan() {

    let html = "";

    if (player.HP < player.BASE_HP) {
        html = "<span class=";

        if (player.HP < (player.BASE_HP / 3)) {
            html += "red";
        } else {
            html += "yellow";
        }

        html += ">";

    }
    
    return html;
}

function draw(entity) {
    $(entity).innerHTML = "";

    let html = "";

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (Matrix[entity][row][col] === entity || Matrix[entity][row][col] === MAXION) {
                html += "<span style='background-color: " + bodyBackground + ";'>";
            }

            html += Matrix[entity][row][col];
            
            if (Matrix[entity][row][col] === entity || Matrix[entity][row][col] === MAXION) {
                html += "</span>";
            }
        }
        html += "<br>";
    }

    $(entity).innerHTML = html;
}

function drawMap() {
	
	$("level").innerHTML = "";
	let html = "";

    	for (let row = 0; row < ROWS; row++) {
		    for (let col = 0; col < COLS; col++) {
			    if (map[row][col] !== null) {
                    html += map[row][col];
                } else {
                    html += SPACE;
                }
		    }
		    
            html += "<br>";
	}

	$("level").innerHTML = html;
	html = "";
}

function drawStats() {

    $("stats").innerHTML = "HP: " 
        + damageSpan()
		+ player.HP
        + closeSpan()
        + "/" + player.BASE_HP
        + " ATK: "
		+ player.ATK
        + " DEF: "
		+ player.DEF
        + " SHARDS: "
		+ player.SHARDS
        + " TOP: "
        + highscores
        + " DLVL: " 
        + level;
}

function clearStatus() {
    $("status").innerHTML = "";
}

function drawStatus(message) {
    $("status").innerHTML = message;
    let timeout = setTimeout(function() {
        clearStatus();
    }, 1000 * SECONDS_DISPLAY_STATUS);
}

function refreshScreen() {
    drawMap();
    drawStats();
    draw(MINION);
    draw(POTION);
    draw(PLAYER);
    draw(SHARD);
    draw(BUFF);
}

function updateUIColor(element, palette) {
    if (element === BACKGROUND) {
        if (player.DETERIORATION < palette.length) {
            bodyBackground = palette[player.DETERIORATION]; 
            document.querySelector("body").style.background = bodyBackground;
        }
    } else if (element === TEXT) {
        if (player.LEECH < palette.length) {
            textColor = palette[player.LEECH];
            $("level").style.color = textColor;
            $("stats").style.color = textColor;
            $("status").style.color = textColor;
        }
    }
}

