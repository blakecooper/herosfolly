const RAW = {
    "entities": {
      "make": function (o) {
          let e = new Entity();
          for (prop in this.o) {
              e[prop] = this.o[prop];
          }
  
          return e;
      },
      "player": {
        "id": "player",
        "base_hp": 10,
        "hp": 10,
        "atk": 10,
        "def": 10,
        "shards": 0,
        "renderable": {
          "symbol": "@",
          "color": "WHITE"
        },
        "lucky": function () {
          if (this.hp < this.base_hp) {
            this.hp++;
          }  
        }
      },
      "enemies": [
      {
        "id": "minion",
        "base_hp": 10,
        "hp": 10,
        "atk": 4,
        "def": 3,
        "shards": 0,
        "renderable": {
          "symbol": "m",
          "color": "red"
        },
        "spawnRate": 1,
      },
      {
        "id": "maxion",
        "base_hp": 22,
        "hp": 22,
        "atk": 6,
        "def": 6,
        "shards": 0,
        "renderable": {
          "symbol": "M",
          "color": "red"
        },
        "spawnRate": .2,
      }],
    },
    "items": [
      {
        "id": "potion",
        "render": {
            "symbol": "!",
            "color": ""
        },
        "onConsume": function (consumer) {
            if (consumer.canFight()) {
                consumer.hp++;
            }
        }
    }]
}
