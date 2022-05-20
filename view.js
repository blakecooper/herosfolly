let screenWidth = -1;
let screenHeight = -1;
let buffer = 20;
window.addEventListener("load", () => {
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	
	sizeElementsToWindow();
});

window.addEventListener("resize", () => {
	sizeElementsToWindow();	
});

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

function sizeElementsToWindow() {

//If screen is in portrait mode, leave room for stats and status at the bottom
if (screenWidth > screenHeight && isMobile) {
	$("body").style = "font-size: 3vw;";
} else {
	$("body").style = "font-size: 4vw;";
}

let style = window.getComputedStyle(body, null).getPropertyValue('font-size');
let systemFontSize = parseFloat(style);
		let statsStyleUpdate = "top: " + (systemFontSize * ROWS + buffer) + "px;";
		$("stats").style = statsStyleUpdate;
		let statusStyleUpdate = "top: " + (systemFontSize * ROWS + buffer + 35) + "px;"; 
		$("status").style = statusStyleUpdate;
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

