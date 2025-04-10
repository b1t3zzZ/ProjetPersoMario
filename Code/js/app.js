window.myGamePiece = null;
window.allComponents = [];

function createComponents() {
    const components = [];

    const levelMap = [
        ".............................................................",
        ".............................................................",
        ".............................................................",
        ".................==..........................................",
        ".............................................................",
        ".............................................................",
        ".............................................................",
        ".............................................................",
        "................=OO=.........................................",
        ".............................................................",
        ".............................................................",
        ".............................................................",
        "#...........#....==....#.....................................",
        "#..........##....==....##....................................",
        "#.........###..........###...................................",
        "#........####..........####..................................",
        "#.@.....#####.^......^.#####......<...#......................",
        "#######################################################......",
    ];

    for (let row = 0; row < levelMap.length; row++) {
        for (let col = 0; col < levelMap[row].length; col++) {
            const char = levelMap[row][col];
            let x = col * 40;
            let y = row * 40;

            switch (char) {
                case '#':
                    components.push(new component(40, 40, './images/terraMario.png', x, y));
                    break;
                case '=':
                    components.push(new component(40, 40, './images/blockMario.png', x, y));
                    break;
                case '@':
                    myGamePiece = new component(35,55, "./images/playerMario.png", x, y);
                    break;
                case 'O':
                    components.push(new component(40, 40, './images/luckyMario.png', x, y));
                    break;
                case '^':
                    components.push(new component(35, 35, './images/mushroomMario.png', x, y));
                    break;
                case '<':
                    components.push(new component(35, 35, './images/mushroomMario.png', x, y));
                    break;
            }
        }
    }

    return components;
}

function component(width, height, imageSrc, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageSrc;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.5;
    this.gravitySpeed = 0;
    this.jumpStrenght = -13;
    this.isJumping = false;

    this.update = function () {
        if (this.image.complete) {
            myGameArea.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    };

    this.newPos = function () {
        this.x += this.speedX;
        this.gravitySpeed += this.gravity;
        this.y += this.speedY + this.gravitySpeed;
    };

    this.hitSides = function () {
        const rockbottom = myGameArea.canvas.height - this.height;
        const rocksides = myGameArea.canvas.width - this.width;

        if (this.x > rocksides) this.x = rocksides;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
            this.isJumping = false;
        }
        if (this.x < 0) this.x = 0;
    };

    this.jump = function () {
        const marioJump = new Audio("./sounds/mario-jump.mp3");
        marioJump.volume = 0.08;

        if (!this.isJumping) {
            this.gravitySpeed = this.jumpStrenght;
            this.isJumping = true;

            if (!marioJump.paused) {
                marioJump.currentTime = 0;
            }
            marioJump.play();
        }
    };
}

window.updateGameArea = function () {
    myGameArea.clear();

    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;

    if (myGameArea.keys && myGameArea.keys[65]) myGamePiece.speedX = -4;
    if (myGameArea.keys && myGameArea.keys[68]) myGamePiece.speedX = 4;
    if (myGameArea.keys && myGameArea.keys[87]) myGamePiece.jump();
    if (myGameArea.keys[65] && myGameArea.keys[68]) myGamePiece.speedX = 0;

    allComponents.forEach((comp) => {
        comp.update();
        comp.hitSides();
    });

    myGamePiece.update();
    myGamePiece.newPos();
    myGamePiece.hitSides();
};

function startGame() {
    window.allComponents = createComponents();
    myGameArea.start();
}

startGame();
