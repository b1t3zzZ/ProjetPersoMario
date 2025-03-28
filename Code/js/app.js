const levelMap = [
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...............................................................................................................",
    "...........................................................=.........=.........................................",
    "...........................................................=.........=.........................................",
    "...........................................................=.........=.........................................",
    "....#......................................................=.........=.........................................",
    "....#......................................................=.........=.........................................",
    "....#......................................................=.........=.........................................",
    "....#......................................................=.........=.........................................",
    "....#...................#.....#............................=.........=.........................................",
    "....#..................##.....##........=O=.....=O=........=.........=.........................................",
    "....#.................###.....###....................................=.........................................",
    "....#..@.............####..^..####.......................<...........=.........................................",
    "....###########################################################################################################",
    "..............................................................................................................."
  ];


//Постройка уровня
const Level = class Level {
    constructor(plan) {
        const rows = plan.trim().split("\n").map(l => [...l]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];

        this.rows = rows.map((row, y) => {
            return row.map((ch, x) => {
                const type = levelChars[ch];
                if (typeof type == "string") return type;
                this.startActors.push(
                    type.create(new Vec(x, y), ch));
                return "empty";
            });
        });
    }
}


//Проверка уровня
const State = class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }
    static start(level) {
        return new State(level, level.startActors, "playing");
    }
    get player() {
        return this.actors.find(a => a.type == "player");
    }
}

//Cложение и умножение векторов на скаляр
const Vec = class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y)
    }
    times(factor) {
        return new Vec(this.x * factor, this.y * factor)
    }
}


//Символы за что отвечают
const levelChars = {
    ".": "empty",
    "#": "wall",
    "@": Player,
    "o": Coin,

}