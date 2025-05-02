// Инициализация Matter.js модулей
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body;

// Глобальные переменные
window.isJumping = false;
window.jumpStartTime = 0;
window.myGamePiece = null;
window.allComponents = [];
window.physicsObjects = {};
let scoreValue = 0;
let cameraOffsetX = 0;
let cameraOffsetY = 0;

// Создание компонентов на уровне из текстовой карты
function createComponents() {
    const components = [];

    const levelMap = [
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "..........................................................................................................................................................................................................................................................................",
        "............*.........................................................................................................................................................................................................................................................................",
        "......................................................................................................................................................................................................................................................................................",
        "............*.........................................................................................................................................................................................................................................................................",
        ".......................................................................................................................................................................................................................................................................................",
        "............*..........................................................................................................................................................................................................................................................................",
        ".......................................................................................................................................................................................................................................................................................",
        "............*..........................................................................................................................................................................................................................................................................",
        ".......................OO..................................................................................................................................................................................................................................................",
        "............*..........................................................................................................................................................................................................................................................................",
        ".......................................................................................................................................................................................................................................................................................",
        "............*............@..............I........................................I....................................................................................................................................................................................................",
        "##########################################################################################################################################################################################################################################################################",
        "##########################################################################################################################################################################################################################################################################",


    ];


    for (let row = 0; row < levelMap.length; row++) {
        for (let col = 0; col < levelMap[row].length; col++) {
            const char = levelMap[row][col];
            let x = col * 40;
            let y = row * 40;

            switch (char) {
                case '#': // Стена
                    const terrain = new Component(40, 40, './images/terraMario.png', x, y, true);
                    components.push(terrain);
                    break;

                case '=': // Блок
                    const block = new Component(40, 40, './images/blockMario.png', x, y, true);
                    components.push(block);
                    break;

                case '@': // Игрок
                    myGamePiece = new Component(35, 55, "./images/playerMario.png", x, y, false);
                    myGamePiece.sensorOffset = 5;
                    Body.setInertia(myGamePiece.body, Infinity);
                    break;

                case 'O': // Лаки-блок
                    const lucky = new Component(40, 40, './images/luckyMario.png', x, y, true);
                    lucky.type = 'lucky';
                    lucky.used = false;
                    components.push(lucky);

                    // Сенсор под блоком
                    const plate = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'luckySensor'
                    });
                    plate.luckyBlock = lucky;
                    World.add(myGameArea.engine.world, plate);
                    break;

                case '*':
                    barier = new Component(1, 40, './images/barierMario.png', x, y, true);
                    components.push(barier);
                    break;

                case 'I': // Монетка
                    const truba = new Component(100, 100, './images/trubaMario.png', x, y, true);
                    components.push(truba);

                    break;

                case '<': // Гриб
                    const mushroom = new Component(35, 35, './images/mushroomMario.png', x, y, false);
                    components.push(mushroom);
                    break;
            }
        }
    }

    return components;
}

// Класс компонента уровня
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
        density: isStatic ? 1 : 0.1,
        slop: 0.01
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

            if (!marioJump.paused) marioJump.currentTime = 0;
            marioJump.play();
        }
    };
}

// Основной игровой цикл
window.updateGameArea = function () {
    myGameArea.clear();

    if (myGamePiece) {
        checkIfOnGround();

        let xVelocity = 0;
        if (myGameArea.keys?.[65]) xVelocity = -5; // A — влево
        if (myGameArea.keys?.[68]) xVelocity = 5;  // D — вправо

        if (myGameArea.keys?.[87]) {               // W — прыжок
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

        const playerX = myGamePiece.body.position.x;
        const playerY = myGamePiece.body.position.y;

        const marginX = myGameArea.canvas.width / 3;
        const marginY = myGameArea.canvas.height / 9;

        const leftLimit = cameraOffsetX + marginX;
        const rightLimit = cameraOffsetX + myGameArea.canvas.width - marginX;
        const topLimit = cameraOffsetY + marginY;
        const bottomLimit = cameraOffsetY + myGameArea.canvas.height - marginY;

        // Горизонтальное перемещение
        if (playerX < leftLimit) {
            cameraOffsetX = playerX - marginX;
        } else if (playerX > rightLimit) {
            cameraOffsetX = playerX - (myGameArea.canvas.width - marginX);
        }

        // Вертикальное перемещение
        if (playerY < topLimit) {
            cameraOffsetY = playerY - marginY;
        } else if (playerY > bottomLimit) {
            cameraOffsetY = playerY - (myGameArea.canvas.height - marginY);
        }

    }

    const ctx = myGameArea.context;
    ctx.save();
    ctx.translate(-cameraOffsetX, -cameraOffsetY)


    allComponents.forEach(comp => comp.update());

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
    ctx.restore();
};

// Создание границ уровня
/*function createBoundaries() {
    const thickness = 50;
    const worldWidth = myGameArea.canvas.width;
    const worldHeight = myGameArea.canvas.height;

    const ground = Bodies.rectangle(worldWidth / 2, worldHeight + thickness / 2, worldWidth + thickness * 2, thickness, { isStatic: true });
    const leftWall = Bodies.rectangle(-thickness / 2, worldHeight / 2, thickness, worldHeight * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(worldWidth + thickness / 2, worldHeight / 2, thickness, worldHeight * 2, { isStatic: true });

    World.add(myGameArea.engine.world, [ground, leftWall, rightWall]);
}*/

// Проверка, стоит ли игрок на поверхности
function checkIfOnGround() {
    if (!myGamePiece) return;

    const sensorWidth = myGamePiece.width * 0.9;
    const sensorHeight = 5;
    const pos = myGamePiece.body.position;

    const sensor = {
        min: { x: pos.x - sensorWidth / 2, y: pos.y + myGamePiece.height / 2 },
        max: { x: pos.x + sensorWidth / 2, y: pos.y + myGamePiece.height / 2 + sensorHeight }
    };

    const allBodies = Composite.allBodies(myGameArea.engine.world);
    const collisions = Matter.Query.region(allBodies, sensor);
    const touching = collisions.filter(body => body !== myGamePiece.body);
    myGamePiece.isOnGround = touching.length > 0;
}

// Активация лаки-блока
function triggerLuckyBlock(block) {
    if (block.used) return;

    console.log("🎁 Активирован lucky-блок!");
    block.used = true;

    // Подпрыгивание
    Body.translate(block.body, { x: 0, y: -5 });
    setTimeout(() => {
        Body.translate(block.body, { x: 0, y: 5 });
    }, 100);

    // Замена изображения
    const newImage = new Image();
    newImage.onload = () => block.image = newImage;
    newImage.src = './images/blockMario.png';

    // Создание монеты
    const coin = new Component(35, 35, './images/coinMario.png', block.x, block.y - 40, false);
    coin.type = 'coin';
    Body.setVelocity(coin.body, { x: 0.7, y: -5 });
    allComponents.push(coin);
}

// Запуск игры
function startGame() {
    myGameArea.start();
    myGameArea.engine.world.gravity.y = 3;

    //createBoundaries();
    window.allComponents = createComponents();

    // Обработка столкновений
    Matter.Events.on(myGameArea.engine, "collisionActive", function (event) {
        const player = myGamePiece?.body;
        if (!player) return;

        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            const sensor = [bodyA, bodyB].find(b => b.label === 'luckySensor');
            const playerTouch = [bodyA, bodyB].find(b => b === player);



            const otherBody = (bodyA === player) ? bodyB : (bodyB === player) ? bodyA : null;
            if (!otherBody) return;

            const dx = player.position.x - otherBody.position.x;
            const direction = dx > 0 ? 1 : -1;
            // Удар по lucky-блоку
            if (sensor && playerTouch) {
                const lucky = sensor.luckyBlock;
                if (lucky && !lucky.used) {
                    triggerLuckyBlock(lucky);
                }
            }
            

            for (let i = allComponents.length - 1; i >= 0; i--) {
                const comp = allComponents[i];

                if (comp.body === otherBody) {
                    const playerBottom = player.position.y + myGamePiece.height / 2;
                    const blockTop = comp.body.position.y - comp.height / 2;

                    const standing = playerBottom <= blockTop + 5 && player.velocity.y >= 0;
                    if (standing) {
                        myGamePiece.isOnGround = true;
                    }

                    // Сбор монеты
                    if (comp.type === 'coin') {
                        World.remove(myGameArea.engine.world, comp.body);
                        allComponents.splice(i, 1);

                        const coinSound = new Audio("./sounds/mario-lucky-takes.mp3");
                        coinSound.volume = 0.25;
                        coinSound.play();

                        scoreValue += 200;
                        const scoreElement = document.getElementById('score');
                        if (scoreElement) {
                            scoreElement.textContent = `Score: ${scoreValue}`;
                        }
                    }
                }
            }
        });
    });
}

window.onload = startGame;
