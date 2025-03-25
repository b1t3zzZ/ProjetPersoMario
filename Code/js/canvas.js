//Запуск игры
const scale = 20;

//Результат
const results = [
    { name: "Satisfied", count: 1043, color: "lightblue" },
    { name: "Neutral", count: 563, color: "lightgreen" },
    { name: "Unsatisfied", count: 510, color: "pink" },
    { name: "No comment", count: 175, color: "silver" }
];

//Переворот
function flipHorizontally(context, around) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(around, 0);
}

//Canvas окно
class marioMap {
    constructor(parent, level) {
        this.canvas.id = "canvasStart";
        this.canvas.width = Math.min(window.innerWidth * 0.75, level.width * scale);
        this.canvas.height = Math.min(window.innerHeight * 0.75, level.height * scale);
        this.canvas.style.justifyContent = "center";
        this.canvas.style.alignItems = "center";
        this.canvas.style.boxSizing = "border-box";
        this.canvas.style.position = "absolute";
        parent.appendChild(this.canvas);
        this.viewport = {
            left: 0,
            top: 0,
            width: this.canvas.width / scale,
            height: this.canvas.height / scale
        };
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 10);
    }
    clear() {
        this.canvas.remove();
    }
}
//Обновление площади и назначение кнопок
function updateGameArea() {
    marioMap.clear();
}

//
marioMap.prototype.syncState = function (state) {
    this.updateViewport(state);
    this.clearDisplay(state.status);
    this.drawBackground(state.level);
    this.drawActors(state.actors);
};

//Следование камеры за персонажем
marioMap.prototype.updateViewport = function (state) {
    const view = this.viewport, margin = view.width / 3;
    const player = state.player;
    const center = player.pos.plus(player.size.times(0.5));

    if (center.x < view.left + margin) {
        view.left = Math.max(center.x - margin, 0)
    } else if (center.x > view.left + view.width - margin) {
        view.left = Math.min(center.x + margin - view.width, state.level.width - view.width);
    }
    if (center.y < view.top + margin) {
        view.top = Math.max(center.y - margin, 0)
    } else if (center.y > view.top + view.height - margin) {
        view.top = Math.min(center.y + margin - view.height, state.level.height - view.height)
    }
}

//
marioMap.prototype.clearDisplay = function () {
    if (status === "won") {
        this.context.fillStyle = 'rgb(68, 191, 255)';
    }
    else if (status === "lost") {
        this.context.fillStyle = 'rgb(44, 136, 214)';
    }
    else {
        this.context.fillStyle = 'rgb(52, 166, 251)';
    }
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

//

const otherSprites = document.createElement("img");
otherSprites.src = "./images/spritesMario.png"

marioMap.prototype.drawBackground = function (level) {
    const { left, top, width, height } = this.viewport;
    const xStart = Math.floor(left);
    const xEnd = Math.ceil(left + width);
    const yStart = Math.floor(top);
    const yEnd = Math.ceil(top + height);

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let tile = level.rows[y][x];
            if (tile === 'empty') continue;
            const screenX = (x - left) * scale;
            const screenY = (y - top) * scale;
            const tileX = tile === 'lava' ? scale : 0;
            this.cx.drawImage(otherSprites, tileX, 0, scale, scale, screenX, screenY, scale, scale);
        }
    }
};