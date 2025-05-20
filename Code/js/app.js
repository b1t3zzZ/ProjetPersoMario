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

                case 'I': // Труба
                    const truba = new Component(80, 50, './images/trubaMario.png', x, y, true);
                    components.push(truba);

                    break;

                case '<': // Гриб
                    const mushroom = new Component(35, 35, './images/mushroomMario.png', x, y, false);
                    components.push(mushroom);
                    break;

                case 'U':
                    const konec = new Component(160, 40, './images/konecTrybiMario.png', x, y, true);
                    components.push(konec);
                    break;

                case '1':
                    const wvoid = new Component(50, 50, "./images/barierMario - Copie.png", x, y, true);
                    wvoid.type = 'wvoid'
                    components.push(wvoid);
                    break;

                case "2":
                    const flag = new Component(80, 350, "./images/flagMario.png", x, y, true)
                    flag.type = "flag";
                    components.push(flag);

                    const flagSensor = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'flag'
                    });
                    flagSensor.flag = flag;
                    World.add(myGameArea.engine.world, flagSensor);
                    break;

                case "4":
                    const nothing = new Component(50, 50, "./images/nothingMario.png", x, y, true);
                    nothing.type = "nothing"
                    nothing.used = false;
                    components.push(nothing);

                    // Сенсор под блоком
                    const nameplate = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'nothing'
                    });
                    nameplate.nothing = nothing;
                    World.add(myGameArea.engine.world, nameplate);
                    break;
                case "5":
                    const changes = new Component(50, 50, "./images/barierMario - Copie.png", x, y, true);
                    changes.type = "changes";
                    components.push(changes);

                    // Сенсор под блоком
                    const changesSensor = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'changes'
                    });
                    changesSensor.changes = changes;
                    World.add(myGameArea.engine.world, changesSensor);
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
            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -20 });
            this.isOnGround = false;

            if (!marioJump.paused) marioJump.currentTime = 0;
            marioJump.play();
        }
    };
}

// Основной игровой цикл
window.updateGameArea = function () {
    myGameArea.clear();

    updateMushroomsAI();

    if (myGamePiece) {
        checkIfOnGround();

        let xVelocity = 0;
        if (myGameArea.keys?.[65]) xVelocity = -5; // A — влево
        if (myGameArea.keys?.[68]) xVelocity = 5;  // D — вправо

        if (myGameArea.keys?.[87] || myGameArea.keys?.[32]) {// W — прыжок
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

        if (jumpDuration < 150) {
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

function nameplate(nothing) {
    if (nothing.used) return;

    alert("Il n'y a absolument rien ici");
    nothing.used = true;
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


function mushroomCanJump(mushroom) {
    // Проверяем, стоит ли гриб на земле
    const pos = mushroom.body.position;

    // Проверяем, что гриб стоит на земле — похожая логика как для игрока
    const sensorWidth = mushroom.width * 0.9;
    const sensorHeight = 5;

    const sensor = {
        min: { x: pos.x - sensorWidth / 2, y: pos.y + mushroom.height / 2 },
        max: { x: pos.x + sensorWidth / 2, y: pos.y + mushroom.height / 2 + sensorHeight }
    };

    const allBodies = Composite.allBodies(myGameArea.engine.world);
    const collisions = Matter.Query.region(allBodies, sensor);
    const touchingGround = collisions.some(body => {
        // Исключаем тело самого гриба
        return body !== mushroom.body && body.isStatic;
    });

    if (!touchingGround) return false;

    // Проверяем блок прямо перед грибом (в направлении движения)
    const directionX = mushroom.body.velocity.x > 0 ? 1 : (mushroom.body.velocity.x < 0 ? -1 : 0);
    if (directionX === 0) return false;

    // Создаем прямоугольник перед грибом (на уровне середины высоты)
    const frontSensor = {
        min: { x: pos.x + directionX * mushroom.width / 2, y: pos.y - mushroom.height / 4 },
        max: { x: pos.x + directionX * (mushroom.width / 2 + 5), y: pos.y + mushroom.height / 4 }
    };

    const frontCollisions = Matter.Query.region(allBodies, frontSensor);
    const blockAhead = frontCollisions.some(body => {
        return body !== mushroom.body && body.isStatic;
    });

    return blockAhead;
}

function mushroomJump(mushroom) {
    if (mushroomCanJump(mushroom)) {
        Body.setVelocity(mushroom.body, { x: mushroom.body.velocity.x, y: -12 });
    }
}

function updateMushroomsAI() {
    if (!myGamePiece) return;
    const playerPos = myGamePiece.body.position;

    allComponents.forEach(comp => {
        if (comp.image.src.includes('mushroomMario.png')) {
            const mushroomPos = comp.body.position;

            const visionRadius = 400;
            const dx = playerPos.x - mushroomPos.x;
            const dy = playerPos.y - mushroomPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < visionRadius) {
                const speed = 3;
                const directionX = dx > 0 ? 1 : -1;

                Body.setVelocity(comp.body, { x: speed * directionX, y: comp.body.velocity.y });

                // Проверяем, нужно ли прыгать
                mushroomJump(comp);

            } else {
                Body.setVelocity(comp.body, { x: 0, y: comp.body.velocity.y });
            }
            Body.setAngle(comp.body, 0);
            Body.setAngularVelocity(comp.body, 0);

        }
    });
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
            const sensorOfNamePlate = [bodyA, bodyB].find(b => b.label === 'nothing');
            const playerTouch = [bodyA, bodyB].find(b => b === player);



            const otherBody = (bodyA === player) ? bodyB : (bodyB === player) ? bodyA : null;
            if (!otherBody) return;

            const comp = allComponents.find(c => c.body === otherBody);
            if (comp && comp.type === 'wvoid') {
                console.log("💀 Игрок упал!");
                World.remove(myGameArea.engine.world, myGamePiece.body);
                stopTimer();
                lostGame();
                return;
            }


            if (comp && comp.type === "flag") {
                if (scoreValue > 5000) {
                    console.log("You're win!");
                    World.remove(myGameArea.engine.world, myGamePiece.body);
                    stopTimer();
                    gameWin();
                } else {
                    alert("Mario n'est pas content de toi. Parce que tu ne m'as pas apporté 5000 pièces, tu dois tout recommencer depuis le début.");
                    location.reload();
                }
                // Отталкивание персонажа при столкновении с флагом
                const pushBackForce = 10.1; // уменьшенная сила отталкивания
                const angle = Math.atan2(myGamePiece.body.position.y - comp.body.position.y, myGamePiece.body.position.x - comp.body.position.x);
                const force = Matter.Vector.create(Math.cos(angle) * pushBackForce, Math.sin(angle) * pushBackForce);

                // Применяем силу отталкивания к персонажу
                Matter.Body.applyForce(myGamePiece.body, myGamePiece.body.position, force);
            }




            // Удар по lucky-блоку
            if (sensor && playerTouch) {
                const lucky = sensor.luckyBlock;
                if (lucky && !lucky.used) {
                    triggerLuckyBlock(lucky);
                }
            }

            if (sensorOfNamePlate && playerTouch) {
                const tablichka = sensorOfNamePlate.nothing;
                if (tablichka && !tablichka.used) {
                    nameplate(tablichka);
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

                    // Проверяем столкновение с грибом
                    if (comp.image.src.includes('mushroomMario.png')) {
                        // Определяем позиции для направления столкновения
                        const playerBottom = player.position.y + myGamePiece.height / 2;
                        const playerTop = player.position.y - myGamePiece.height / 2;
                        const playerVelocityY = player.velocity.y;

                        const mushroomTop = comp.body.position.y - comp.height / 2;
                        const mushroomBottom = comp.body.position.y + comp.height / 2;

                        // Если персонаж прыгает сверху
                        if (playerBottom <= mushroomTop + 5 && playerVelocityY > 0) {
                            // Удаляем гриб
                            World.remove(myGameArea.engine.world, comp.body);
                            allComponents.splice(allComponents.indexOf(comp), 1);
                            scoreValue += 500;
                            let scoreElement = document.getElementById('score');
                            if (scoreElement) {
                                scoreElement.textContent = `Score: ${scoreValue}`;
                            }
                            console.log("🍄 Гриб убит сверху!");
                        } else {
                            // Иначе — персонаж умирает
                            console.log("💀 Персонаж убит грибом!");
                            World.remove(myGameArea.engine.world, myGamePiece.body);
                            stopTimer();
                            lostGame();
                        }
                    }

                    // Сбор монеты
                    if (comp.type === 'coin') {
                        World.remove(myGameArea.engine.world, comp.body);
                        allComponents.splice(i, 1);

                        const coinSound = new Audio("./sounds/mario-lucky-takes.mp3");
                        coinSound.volume = 0.25;
                        coinSound.play();

                        scoreValue += 200;
                        let scoreElement = document.getElementById('score');
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
