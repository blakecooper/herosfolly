//Entity prototype used to ensure all entities have basic props
function Entity () {
  this.id = "";
  this.coords = {
    "x": -1,
    "y": -1,
  };
  this.isMonstrous = false;
  this.canFight = function () {
    if (this.hp !== undefined
    && this.atk !== undefined
    && this.def !== undefined) {
        return true;
    } else {
        return false;
    }
  };
  this.holdsShards = function() {
    if (this.shards !== undefined) {
        return true;
    } else {
        return false;
    }
  };
  this.isLucky = function () {
    if (this.lucky !== undefined) {
        return true;
    } else {
        return false;
    }
  };
  this.canSpawn = function () {
    if (this.spawnRate !== undefined) {
        return true;
    } else {
        return false;
    }
  };
  this.canBeConsumed = function () {
    if (this.onConsume !== undefined) {
        return true;
    } else {
        return false;
    }
  };
  this.render = {
      "symbol": "",
      "color": ""
  };
}
