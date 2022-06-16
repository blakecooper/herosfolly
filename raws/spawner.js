const SPAWN = {
  "player": {
    "entity": function() {
      await loadJSON("raws/player.json", parseData);
      const player = {};
      function parseData(data) {
        player = JSON.parse(data[0]);
      }
      return player;
    }
  }
};
