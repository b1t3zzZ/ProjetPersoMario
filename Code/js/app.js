// Matter.js module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body;

window.myGamePiece = null;
window.allComponents = [];
window.physicsObjects = {}; // Store references to physics bodies


function createComponents() {
    const components = [];

    const levelMap = [
        "####################################",
        "#..................................#",
        "#..................................#",
        ".................==................#",
        "...................................#",
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
                    const terrain = new component(40, 40, './images/terraMario.png', x, y, true);
                    components.push(terrain);
                    break;
                case '=':
                    const block = new component(40, 40, './images/blockMario.png', x, y, true);
                    components.push(block);
                    break;
                case '@':
                    myGamePiece = new component(35, 55, "./images/playerMario.png", x, y, false);
                    break;
                case 'O':
                    const lucky = new component(40, 40, './images/luckyMario.png', x, y, true);
                    components.push(lucky);
                    break;
                case '^':
                case '<':
                    const mushroom = new component(35, 35, './images/mushroomMario.png', x, y, false);
                    components.push(mushroom);
                    break;
            }
        }
    }

    return components;
}

function component(width, height, imageSrc, x, y, isStatic = false) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageSrc;
    this.isStatic = isStatic;
    this.isOnGround = false;
    // Create Matter.js body
    const options = {
        isStatic: isStatic,
        friction: 0.05,
        restitution: 0.2,
        density: isStatic ? 1 : 0.1
    };

    // Create physics body
    this.body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, options);

    // Add to Matter.js world
    World.add(myGameArea.engine.world, this.body);

    // Store reference to physics body
    const bodyId = Math.random().toString(36).substr(2, 9);
    this.bodyId = bodyId;
    physicsObjects[bodyId] = this.body;

    this.update = function () {
        if (this.image.complete) {
            // Update position and rotation from physics engine
            const pos = this.body.position;
            const angle = this.body.angle;

            // Save context, translate and rotate
            myGameArea.context.save();
            myGameArea.context.translate(pos.x, pos.y);
            myGameArea.context.rotate(angle);

            // Draw image centered
            myGameArea.context.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );

            // Restore context
            myGameArea.context.restore();

            // Update visual position properties to match physics body
            this.x = pos.x - this.width / 2;
            this.y = pos.y - this.height / 2;
        }
    };

    this.jump = function () {
        const marioJump = new Audio("./sounds/mario-jump.mp3");
        marioJump.volume = 0.08;



    
        // Check if character is on ground
        const yVelocity = Math.abs(this.body.velocity.y);
        if (yVelocity < 0.1) {
            // Apply upward force
            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -14 });

            if (!marioJump.paused) {
                marioJump.currentTime = 0;
            }
            marioJump.play();
        }
    };
}

window.updateGameArea = function () {
    myGameArea.clear();

    // Process keyboard inputs
    if (myGamePiece) {
        let xVelocity = 0;

        if (myGameArea.keys && myGameArea.keys[65]) xVelocity = -4; // A key
        if (myGameArea.keys && myGameArea.keys[68]) xVelocity = 4;  // D key
        if (myGameArea.keys && myGameArea.keys[87]) myGamePiece.jump(); // W key

        // Update player physics velocity
        if (myGamePiece.body) {
            Body.setVelocity(myGamePiece.body, {
                x: xVelocity,
                y: myGamePiece.body.velocity.y
            });
        }
    }

    // Update all game components
    allComponents.forEach((comp) => {
        comp.update();
    });

    if (myGamePiece) {
        myGamePiece.update();
    }
};

// Set up world boundaries
function createBoundaries() {
    const thickness = 50;
    const worldWidth = myGameArea.canvas.width;
    const worldHeight = myGameArea.canvas.height;

    // Ground
    const ground = Bodies.rectangle(
        worldWidth / 2,
        worldHeight + thickness / 2,
        worldWidth + thickness * 2,
        thickness,
        { isStatic: true }
    );

    // Left wall
    const leftWall = Bodies.rectangle(
        -thickness / 2,
        worldHeight / 2,
        thickness,
        worldHeight * 2,
        { isStatic: true }
    );

    // Right wall
    const rightWall = Bodies.rectangle(
        worldWidth + thickness / 2,
        worldHeight / 2,
        thickness,
        worldHeight * 2,
        { isStatic: true }
    );

    // Add walls to world
    World.add(myGameArea.engine.world, [ground, leftWall, rightWall]);
}

function startGame() {
    myGameArea.start();

    // Set gravity
    myGameArea.engine.world.gravity.y = 1.7;

    // Create world boundaries
    createBoundaries();

    // Create game components
    window.allComponents = createComponents();
}

// Initialize the game
window.onload = startGame;