//mardi, 18 mars 2025, 14:11:48. Tsybulevskyi Maksym

// Matter.js module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body;

window.isJumping = false;
window.jumpStartTime = 0;
window.myGamePiece = null;
window.allComponents = [];
window.physicsObjects = {}; // Store references to physics bodies

function createComponents() {
    const components = [];

    const levelMap = [
        "####################################",
        "#..................................#",
        "#..................................#",
        "#................==................#",
        "#..................................#",
        "#..................................#",
        "#..................................#",
        "#..................................#",
        "#...............=OO=...............#",
        "#..................................#",
        "#..................................#",
        "#..................................#",
        "#...........#....==....#...........#",
        "#..........##....==....##..........#",
        "#.........###..........###.........#",
        "#........####..........####........#",
        "#.@.....#####.^......^.#####......<#",
        "####################################",
    ];

    for (let row = 0; row < levelMap.length; row++) {
        for (let col = 0; col < levelMap[row].length; col++) {
            const char = levelMap[row][col];
            let x = col * 40;
            let y = row * 40;

            switch (char) {
                case '#':
                    const terrain = new Component(40, 40, './images/terraMario.png', x, y, true);
                    components.push(terrain);
                    break;
                case '=':
                    const block = new Component(40, 40, './images/blockMario.png', x, y, true);
                    components.push(block);
                    break;
                case '@':
                    myGamePiece = new Component(35, 55, "./images/playerMario.png", x, y, false);
                    myGamePiece.sensorOffset = 5;
                    Body.setInertia(myGamePiece.body, Infinity);
                    break;
                case 'O':
                    const lucky = new Component(40, 40, './images/luckyMario.png', x, y, true);
                    components.push(lucky);
                    break;
                case '^':
                case '<':
                    const mushroom = new Component(35, 35, './images/mushroomMario.png', x, y, false);
                    components.push(mushroom);
                    break;
            }
        }
    }

    return components;
}

function Component(width, height, imageSrc, x, y, isStatic = false, frameCount = 1) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageSrc;
    this.isStatic = isStatic;
    this.isOnGround = false;
    this.spriteFrames = frameCount;

    const options = {
        isStatic: isStatic,
        friction: 0.05,
        restitution: 0.2,
        density: isStatic ? 1 : 0.1
    };

    this.body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, options);

    World.add(myGameArea.engine.world, this.body);

    const bodyId = Math.random().toString(36).substr(2, 9);
    this.bodyId = bodyId;
    physicsObjects[bodyId] = this.body;

    this.update = function () {
        if (this.image.complete) {
            const pos = this.body.position;
            const angle = this.body.angle;

            myGameArea.context.save();
            myGameArea.context.translate(pos.x, pos.y);
            myGameArea.context.rotate(angle);

            myGameArea.context.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );

            myGameArea.context.restore();

            this.x = pos.x - this.width / 2;
            this.y = pos.y - this.height / 2;
        }
    };

    this.jump = function () {
        const marioJump = new Audio("./sounds/mario-jump.mp3");
        marioJump.volume = 0.08;

        if (this.isOnGround) {

            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -10 });

            this.isOnGround = false;

            if (!marioJump.paused) {
                marioJump.currentTime = 0;
            }
            marioJump.play();
        }
    };
}

window.updateGameArea = function () {
    myGameArea.clear();

    if (myGamePiece) {
        checkIfOnGround();

        let xVelocity = 0;

        if (myGameArea.keys && myGameArea.keys[65]) xVelocity = -4; // A key
        if (myGameArea.keys && myGameArea.keys[68]) xVelocity = 4;  // D key
        if (myGameArea.keys && myGameArea.keys[87]) {
            if (!isJumping && myGamePiece.isOnGround) {
                isJumping = true;
                jumpStartTime = Date.now();
                myGamePiece.jump();
            }
        } else {
            isJumping = false;
        }

        if (myGamePiece.body) {
            Body.setVelocity(myGamePiece.body, {
                x: xVelocity,
                y: myGamePiece.body.velocity.y
            });
        }
        
        Body.setAngle(myGamePiece.body, 0);
    }

    allComponents.forEach((comp) => {
        comp.update();
    });

    // Отладочная отрисовка сенсора под персонажем(Débogage)
    if (myGamePiece) {
        const pos = myGamePiece.body.position;
        const sensorWidth = myGamePiece.width * 0.9;
        const sensorHeight = 5;

        myGameArea.context.save();
        myGameArea.context.strokeStyle = myGamePiece.isOnGround ? 'green' : 'red';
        myGameArea.context.lineWidth = 2;
        myGameArea.context.strokeRect(
            pos.x - sensorWidth / 2,
            pos.y + myGamePiece.height / 2,
            sensorWidth,
            sensorHeight
        );
        myGameArea.context.restore();

    }

    if(isJumping){
        const now = Date.now();
        const jumpDuration = now - jumpStartTime;

        if(jumpDuration < 200){
            Body.setVelocity(myGamePiece.body, {
                x: myGamePiece.body.velocity.x,
                y: myGamePiece.body.velocity.y - 0.5
            })
        }
    }







    if (myGamePiece) {
        myGamePiece.update();
    }
};

// Создание границ мира
function createBoundaries() {
    const thickness = 50;
    const worldWidth = myGameArea.canvas.width;
    const worldHeight = myGameArea.canvas.height;

    const ground = Bodies.rectangle(
        worldWidth / 2,
        worldHeight + thickness / 2,
        worldWidth + thickness * 2,
        thickness,
        { isStatic: true }
    );

    const leftWall = Bodies.rectangle(
        -thickness / 2,
        worldHeight / 2,
        thickness,
        worldHeight * 2,
        { isStatic: true }
    );

    const rightWall = Bodies.rectangle(
        worldWidth + thickness / 2,
        worldHeight / 2,
        thickness,
        worldHeight * 2,
        { isStatic: true }
    );

    World.add(myGameArea.engine.world, [ground, leftWall, rightWall]);
}

// Проверка стоит ли игрок на земле
function checkIfOnGround() {
    if (!myGamePiece) return;

    const sensorWidth = myGamePiece.width * 0.9; // <-- исправил здесь!
    const sensorHeight = 5;
    const pos = myGamePiece.body.position;

    const sensor = {
        min: { x: pos.x - sensorWidth / 2, y: pos.y + myGamePiece.height / 2 },
        max: { x: pos.x + sensorWidth / 2, y: pos.y + myGamePiece.height / 2 + sensorHeight }
    };

    const allBodies = Matter.Composite.allBodies(myGameArea.engine.world);

    const collisions = Matter.Query.region(allBodies, sensor);

    const touching = collisions.filter(body => body !== myGamePiece.body);

    myGamePiece.isOnGround = touching.length > 0;
}

function startGame() {
    myGameArea.start();

    myGameArea.engine.world.gravity.y = 2.1;

    createBoundaries();

    window.allComponents = createComponents();
}

// Initialize the game
window.onload = startGame;
