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
window.physicsObjects = {};

function createComponents() {
    const components = [];

    const levelMap = [
        "####################################",
        "#..................................#",
        "#..................................#",
        "#................==................#",
        "...................................#",
        "...................................#",
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
                        lucky.type = 'lucky';
                        lucky.used = false;
                        components.push(lucky);
                    
                        // 🟦 Сенсор — чуть ниже lucky-блока
                        const plate = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                            isStatic: true,
                            isSensor: true,
                            label: 'luckySensor'
                        });
                    
                        plate.luckyBlock = lucky; // Привязка
                        World.add(myGameArea.engine.world, plate);
                    
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
    this.type = imageSrc.includes('luckyMario.png') ? 'lucky' : 'default';
    this.used = false;

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
        const ctx = myGameArea?.context;
        if (!ctx || !this.image.complete) return;

        const pos = this.body.position;
        const angle = this.body.angle;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        this.x = pos.x - this.width / 2;
        this.y = pos.y - this.height / 2;
    };

    this.jump = function () {
        const marioJump = new Audio("./sounds/mario-jump.mp3");
        marioJump.volume = 0.08;

        if (this.isOnGround) {
            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -8 });
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

        if (myGameArea.keys && myGameArea.keys[65]) xVelocity = -5;
        if (myGameArea.keys && myGameArea.keys[68]) xVelocity = 5;

        if (myGameArea.keys && myGameArea.keys[87]) {
            if (!isJumping && myGamePiece.isOnGround) {
                isJumping = true;
                jumpStartTime = Date.now();
                myGamePiece.jump();
            }
        } else {
            isJumping = false;
        }

        Body.setVelocity(myGamePiece.body, {
            x: xVelocity,
            y: myGamePiece.body.velocity.y
        });

        Body.setAngle(myGamePiece.body, 0);
    }

    allComponents.forEach((comp) => {
        comp.update();
    });

    if (isJumping) {
        const now = Date.now();
        const jumpDuration = now - jumpStartTime;

        if (jumpDuration < 100) {
            Body.setVelocity(myGamePiece.body, {
                x: myGamePiece.body.velocity.x,
                y: myGamePiece.body.velocity.y - 0.7
            });
        }
    }

    if (myGamePiece) {
        myGamePiece.update();
    }
};

function createBoundaries() {
    const thickness = 50;
    const worldWidth = myGameArea.canvas.width;
    const worldHeight = myGameArea.canvas.height;

    const ground = Bodies.rectangle(worldWidth / 2, worldHeight + thickness / 2, worldWidth + thickness * 2, thickness, { isStatic: true });
    const leftWall = Bodies.rectangle(-thickness / 2, worldHeight / 2, thickness, worldHeight * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(worldWidth + thickness / 2, worldHeight / 2, thickness, worldHeight * 2, { isStatic: true });

    World.add(myGameArea.engine.world, [ground, leftWall, rightWall]);
}

function checkIfOnGround() {
    if (!myGamePiece) return;

    const sensorWidth = myGamePiece.width * 0.9;
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

function triggerLuckyBlock(block) {
    if (block.used) return;
    console.log("🎁 Активирован lucky-блок!");
    block.used = true;

    // Эффект "подпрыгивания" блока
    Body.translate(block.body, { x: 0, y: -5 });
    setTimeout(() => {
        Body.translate(block.body, { x: 0, y: 5 });
    }, 100);

    // Замена изображения блока
    const newImage = new Image();
    newImage.onload = () => {
        block.image = newImage;
    };
    newImage.src = './images/blockMario.png';

    // Создание и "выпрыгивание" гриба
    const coin = new Component(35, 35, './images/coinMario.png', block.x, block.y - 40, false);
    Body.setVelocity(coin.body, { x: 0.7, y: -5 }); // вверх и вправо
    allComponents.push(coin);
}


function startGame() {
    myGameArea.start();
    myGameArea.engine.world.gravity.y = 3;

    createBoundaries();
    window.allComponents = createComponents();

    Matter.Events.on(myGameArea.engine, "collisionActive", function (event) {
        const player = myGamePiece?.body;
        if (!player) return;
        const luckyTakes = new Audio("./sounds/mario-lucky-takes.mp3");
        luckyTakes.volume = 0.38;

        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
    
            const sensor = [bodyA, bodyB].find(b => b.label === 'luckySensor');
            const playerTouch = [bodyA, bodyB].find(b => b === player);
    
            if (sensor && playerTouch) {
                const lucky = sensor.luckyBlock;
                if (lucky && !lucky.used) {
                    triggerLuckyBlock(lucky);
                    luckyTakes.play();
                }
            }
    
            // Проверка "стоя на объекте"
            const otherBody = (bodyA === player) ? bodyB :
                              (bodyB === player) ? bodyA : null;
    
            if (!otherBody) return;
    
            for (let comp of allComponents) {
                if (comp.body === otherBody) {
                    const playerBottom = player.position.y + myGamePiece.height / 2;
                    const blockTop = comp.body.position.y - comp.height / 2;
    
                    const standing = playerBottom <= blockTop + 5 && player.velocity.y >= 0;
                    if (standing) {
                        myGamePiece.isOnGround = true;
                    }
                }
            }
        });
    });
    
}

window.onload = startGame;
