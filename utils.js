function $(e) {
	return document.getElementById(e);
}

function blankGrid(matrix) {

	for (let row = 0; row < matrix.length; row++) {
		for (let col = 0; col < matrix[0].length; col++) {
			matrix[row][col] = "&nbsp";
		}
	}
}

function initializeMatrix(rows, cols, character) {
    let matrix = [];

    for (let row = 0; row < rows; row++) {
        matrix.push([]);
        
        for (let col = 0; col < cols; col++) {
            matrix[row].push(character);
        }
    }

    return matrix;
}

function random(value) {
	return Math.floor(Math.random() * value);
}

function refreshScreen() {
    drawMap();
    drawStats();
}

function updateUIColor(palette) {
    document.querySelector("body").style.color = palette[player.DETERIORATION];
}

