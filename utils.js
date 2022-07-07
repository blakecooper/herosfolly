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

  console.log("potion location: " + siteX + ", " + siteY);
  console.log("shard location: " + x + ", " + y);
  console.log("edge endpoint a: " + voronoi.edges[closestEdge].va.x + ", " + voronoi.edges[closestEdge].va.y);
  console.log("edge endpoint b: " + voronoi.edges[closestEdge].vb.x + ", " + voronoi.edges[closestEdge].vb.y);
  let closestSite = {};

  if (voronoi.edges[closestEdge].lSite !== null) {
  console.log("site on left side of edge: " + voronoi.edges[closestEdge].lSite.x + ", " + voronoi.edges[closestEdge].lSite.y);
  }
  
  if (voronoi.edges[closestEdge].rSite !== null) {
  console.log("site on right side of edge: " + voronoi.edges[closestEdge].rSite.x + ", " + voronoi.edges[closestEdge].rSite.y);
  }
  if (voronoi.edges[closestEdge].lSite !== null && (voronoi.edges[closestEdge].x - x < 0 || voronoi.edges[closestEdge].y - y < 0)) {
    closestSite = voronoi.edges[closestEdge].lSite;
  } else if (voronoi.edges[closestEdge].rSite !== null && (voronoi.edges[closestEdge].x - x > 0 || voronoi.edges[closestEdge].y - y > 0)) {
    closestSite = voronoi.edges[closestEdge].rSite;
  } else {
    console.log("Within cell bounds: false");
    return false;
  }
  console.log("within cell bounds: " + (closestSite.x === siteX && closestSite.y === siteY)); 
  return (closestSite.x === siteX && closestSite.y === siteY) ? true : false;
}
