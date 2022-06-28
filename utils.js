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
