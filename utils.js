let isMobile = false;

function random(value) {
	return Math.floor(Math.random() * value);
}

function $(e) {
	return document.getElementById(e);
}

function getListOfEntitiesWhere(property, value) {
    const retVal = [];
    for (entity in RAWS.entities) {
        if (RAWS.entities[entity][property] !== undefined
        && RAWS.entities[entity][property] == value) {
            retVal.push(RAWS.entities[entity]);
        }
    }
    return retVal;
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

