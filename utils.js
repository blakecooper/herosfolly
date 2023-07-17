function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

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

function isInVoronoiCell(x, y, siteX, siteY, voronoi) {
  let closestEdge = -1;
  let closestDist = Number.MAX_VALUE;

  for (let i = 0; i < voronoi.edges.length; i++) {

    let dist = distToSegment(
      {x: x, y: y},
      {x: voronoi.edges[i].va.x, y: voronoi.edges[i].va.y},
      {x: voronoi.edges[i].vb.x, y: voronoi.edges[i].vb.y}
    );

    
    if (Number.isNaN(dist)) { dist = Number.MAX_VALUE; }
    if (dist < closestDist) {
      closestDist = dist;
      closestEdge = i;
    }
  }


  if (voronoi.edges[closestEdge].lSite !== null && (voronoi.edges[closestEdge].lSite.x === siteX && voronoi.edges[closestEdge].lSite.y === siteY)) {
    return true;
  } else if (voronoi.edges[closestEdge].rSite !== null && (voronoi.edges[closestEdge].rSite.x === siteX && voronoi.edges[closestEdge].rSite.y === siteY)) {
    return true;
  } else {
    return false;
  }
}
//Warning": changing these may cause undefined behavior!
const CONSTS = {
  "ESCAPE": 9,
  "LEFT": 0,
  "RIGHT": 1,
  "DOWN": 2,
  "UP": 3,
  "UPLEFT": 4,
  "UPRIGHT": 5,
  "DOWNLEFT": 6,
  "DOWNRIGHT": 7,
  "WAIT": 8,
  "ROW": 0,
  "COL": 1,
  "SHARDS": 1,
  "MONSTERS": 2,
  "PLAYER_MAP": 3,
  "POTIONS_EVERY": 5,
  "SPACE": "&nbsp",
  "BACKGROUND": 0,
  "TEXT": 1,
  "MAP": 0,
  "ENTITIES": 1,
  "HORIZONTAL": 1,
  "VERTICAL": 0
};
