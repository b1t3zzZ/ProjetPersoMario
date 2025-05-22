//mardi, 18 mars 2025, 14:11:48. Tsybulevskyi Maksym

// Initialize Matter.js modules
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body;

// Global variables for game state management
window.isJumping = false;           // Track if player is currently jumping
window.jumpStartTime = 0;           // Timestamp when jump started
window.myGamePiece = null;          // Main player object
window.allComponents = [];          // Array of all game components
window.physicsObjects = {};         // Dictionary of physics bodies
let scoreValue = 0;                 // Current player score
let cameraOffsetX = 0;              // Camera horizontal offset for scrolling
let cameraOffsetY = 0;              // Camera vertical offset for scrolling

// Create game components from text-based level map
function createComponents() {
    const components = [];

    // Iterate through each row and column of the level map
    for (let row = 0; row < levelMap.length; row++) {
        for (let col = 0; col < levelMap[row].length; col++) {
            const char = levelMap[row][col];
            let x = col * 40;  // X position based on column
            let y = row * 40;  // Y position based on row

            // Create different components based on map characters
            switch (char) {
                case '#': // Wall/Terrain block
                    const terrain = new Component(40, 40, './images/terraMario.png', x, y, true);
                    components.push(terrain);
                    break;

                case '=': // Regular block
                    const block = new Component(40, 40, './images/blockMario.png', x, y, true);
                    components.push(block);
                    break;

                case '@': // Player spawn position
                    myGamePiece = new Component(35, 55, "./images/playerMario.png", x, y, false);
                    myGamePiece.sensorOffset = 5;
                    // Prevent player rotation
                    Body.setInertia(myGamePiece.body, Infinity);
                    break;

                case 'O': // Lucky block (coin block)
                    const lucky = new Component(40, 40, './images/luckyMario.png', x, y, true);
                    lucky.type = 'lucky';
                    lucky.used = false;
                    components.push(lucky);

                    // Create sensor below the block to detect player hits
                    const plate = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'luckySensor'
                    });
                    plate.luckyBlock = lucky;
                    World.add(myGameArea.engine.world, plate);
                    break;

                case '*': // Barrier
                    barier = new Component(1, 40, './images/barierMario.png', x, y, true);
                    components.push(barier);
                    break;

                case 'I': // Pipe
                    const truba = new Component(80, 50, './images/trubaMario.png', x, y, true);
                    components.push(truba);
                    break;

                case '<': // Mushroom enemy
                    const mushroom = new Component(35, 35, './images/mushroomMario.png', x, y, false);
                    components.push(mushroom);
                    break;

                case 'U': // Pipe end
                    const konec = new Component(160, 40, './images/konecTrybiMario.png', x, y, true);
                    components.push(konec);
                    break;

                case '1': // Death void
                    const wvoid = new Component(50, 50, "./images/barierMario - Copie.png", x, y, true);
                    wvoid.type = 'wvoid'
                    components.push(wvoid);
                    break;

                case "2": // Victory flag
                    const flag = new Component(80, 350, "./images/flagMario.png", x, y, true)
                    flag.type = "flag";
                    components.push(flag);

                    // Create sensor for flag collision detection
                    const flagSensor = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'flag'
                    });
                    flagSensor.flag = flag;
                    World.add(myGameArea.engine.world, flagSensor);
                    break;

                case "4": // Information block (shows message)
                    const nothing = new Component(50, 50, "./images/nothingMario.png", x, y, true);
                    nothing.type = "nothing"
                    nothing.used = false;
                    components.push(nothing);

                    // Create sensor for message display
                    const nameplate = Bodies.rectangle(x + 20, y + 45, 30, 10, {
                        isStatic: true,
                        isSensor: true,
                        label: 'nothing'
                    });
                    nameplate.nothing = nothing;
                    World.add(myGameArea.engine.world, nameplate);
                    break;

                case "5": // Changes block (special interactive block)
                    const changes = new Component(50, 50, "./images/barierMario - Copie.png", x, y, true);
                    changes.type = "changes";
                    components.push(changes);

                    // Create sensor for changes block
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

// Component class for all game objects
function Component(width, height, imageSrc, x, y, isStatic = false, frameCount = 1) {
    // Basic properties
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageSrc;
    this.isStatic = isStatic;           // Whether object is affected by physics
    this.isOnGround = false;            // Ground detection for jumping
    this.spriteFrames = frameCount;     // For animated sprites
    this.type = imageSrc.includes('luckyMario.png') ? 'lucky' : 'default';
    this.used = false;                  // For interactive objects

    // Physics body configuration
    const options = {
        isStatic: isStatic,
        friction: 0.05,                 // Surface friction
        restitution: 0.2,               // Bounciness
        density: isStatic ? 1 : 0.1,    // Mass density
        slop: 0.01                      // Collision tolerance
    };

    // Create physics body and add to world
    this.body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, options);
    World.add(myGameArea.engine.world, this.body);

    // Generate unique ID for physics object tracking
    const bodyId = Math.random().toString(36).substr(2, 9);
    this.bodyId = bodyId;
    physicsObjects[bodyId] = this.body;

    // Update method - called every frame to render the component
    this.update = function () {
        const ctx = myGameArea?.context;
        if (!ctx || !this.image.complete) return;

        // Get current physics position and rotation
        const pos = this.body.position;
        const angle = this.body.angle;

        // Draw sprite with proper positioning and rotation
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        // Update component position for reference
        this.x = pos.x - this.width / 2;
        this.y = pos.y - this.height / 2;
    };

    // Jump method for player character
    this.jump = function () {
        const marioJump = new Audio("./sounds/mario-jump.mp3");
        marioJump.volume = 0.08;

        // Only jump if on ground
        if (this.isOnGround) {
            Body.setVelocity(this.body, { x: this.body.velocity.x, y: -20 });
            this.isOnGround = false;

            // Play jump sound
            if (!marioJump.paused) marioJump.currentTime = 0;
            marioJump.play();
        }
    };
}

// Main game loop - called every frame
window.updateGameArea = function () {
    myGameArea.clear();

    // Update AI for mushroom enemies
    updateMushroomsAI();

    if (myGamePiece) {
        // Check if player is standing on ground
        checkIfOnGround();

        // Handle player input for movement
        let xVelocity = 0;
        if (myGameArea.keys?.[65]) xVelocity = -5; // A key - move left
        if (myGameArea.keys?.[68]) xVelocity = 5;  // D key - move right

        // Handle jumping (W key or Space)
        if (myGameArea.keys?.[87] || myGameArea.keys?.[32]) {
            if (!isJumping && myGamePiece.isOnGround) {
                isJumping = true;
                jumpStartTime = Date.now();
                myGamePiece.jump();
            }
        } else {
            isJumping = false;
        }

        // Apply horizontal movement while preserving vertical velocity
        Body.setVelocity(myGamePiece.body, {
            x: xVelocity,
            y: myGamePiece.body.velocity.y
        });

        // Prevent player rotation
        Body.setAngle(myGamePiece.body, 0);

        // Camera following logic
        const playerX = myGamePiece.body.position.x;
        const playerY = myGamePiece.body.position.y;

        // Define camera boundaries
        const marginX = myGameArea.canvas.width / 3;
        const marginY = myGameArea.canvas.height / 9;

        const leftLimit = cameraOffsetX + marginX;
        const rightLimit = cameraOffsetX + myGameArea.canvas.width - marginX;
        const topLimit = cameraOffsetY + marginY;
        const bottomLimit = cameraOffsetY + myGameArea.canvas.height - marginY;

        // Update camera position based on player movement
        if (playerX < leftLimit) {
            cameraOffsetX = playerX - marginX;
        } else if (playerX > rightLimit) {
            cameraOffsetX = playerX - (myGameArea.canvas.width - marginX);
        }

        if (playerY < topLimit) {
            cameraOffsetY = playerY - marginY;
        } else if (playerY > bottomLimit) {
            cameraOffsetY = playerY - (myGameArea.canvas.height - marginY);
        }
    }

    // Apply camera offset for rendering
    const ctx = myGameArea.context;
    ctx.save();
    ctx.translate(-cameraOffsetX, -cameraOffsetY)

    // Update and render all components
    allComponents.forEach(comp => comp.update());

    // Extended jump mechanics - provides extra lift during jump
    if (isJumping) {
        const now = Date.now();
        const jumpDuration = now - jumpStartTime;

        // Apply additional upward force for first 150ms of jump
        if (jumpDuration < 150) {
            Body.setVelocity(myGamePiece.body, {
                x: myGamePiece.body.velocity.x,
                y: myGamePiece.body.velocity.y - 0.7
            });
        }
    }

    // Render player
    if (myGamePiece) {
        myGamePiece.update();
    }
    ctx.restore();
};

// Check if player is standing on ground for jump mechanics
function checkIfOnGround() {
    if (!myGamePiece) return;

    // Create invisible sensor below player feet
    const sensorWidth = myGamePiece.width * 0.9;
    const sensorHeight = 5;
    const pos = myGamePiece.body.position;

    const sensor = {
        min: { x: pos.x - sensorWidth / 2, y: pos.y + myGamePiece.height / 2 },
        max: { x: pos.x + sensorWidth / 2, y: pos.y + myGamePiece.height / 2 + sensorHeight }
    };

    // Check for collisions with ground objects
    const allBodies = Composite.allBodies(myGameArea.engine.world);
    const collisions = Matter.Query.region(allBodies, sensor);
    const touching = collisions.filter(body => body !== myGamePiece.body);
    myGamePiece.isOnGround = touching.length > 0;
}

// Display message when interacting with info block
function nameplate(nothing) {
    if (nothing.used) return;

    alert("Il n'y a absolument rien ici"); // "There is absolutely nothing here"
    nothing.used = true;
}

// Activate lucky block when hit from below
function triggerLuckyBlock(block) {
    if (block.used) return;

    console.log("🎁 Lucky block activated!");
    block.used = true;

    // Block bounce animation
    Body.translate(block.body, { x: 0, y: -5 });
    setTimeout(() => {
        Body.translate(block.body, { x: 0, y: 5 });
    }, 100);

    // Change block appearance to used state
    const newImage = new Image();
    newImage.onload = () => block.image = newImage;
    newImage.src = './images/blockMario.png';

    // Create coin that pops out
    const coin = new Component(35, 35, './images/coinMario.png', block.x, block.y - 40, false);
    coin.type = 'coin';
    Body.setVelocity(coin.body, { x: 0.7, y: -5 }); // Give coin initial velocity
    allComponents.push(coin);
}

// Check if mushroom can jump over obstacles
function mushroomCanJump(mushroom) {
    const pos = mushroom.body.position;

    // Check if mushroom is on ground (similar to player ground check)
    const sensorWidth = mushroom.width * 0.9;
    const sensorHeight = 5;

    const sensor = {
        min: { x: pos.x - sensorWidth / 2, y: pos.y + mushroom.height / 2 },
        max: { x: pos.x + sensorWidth / 2, y: pos.y + mushroom.height / 2 + sensorHeight }
    };

    const allBodies = Composite.allBodies(myGameArea.engine.world);
    const collisions = Matter.Query.region(allBodies, sensor);
    const touchingGround = collisions.some(body => {
        return body !== mushroom.body && body.isStatic;
    });

    if (!touchingGround) return false;

    // Check for obstacle in front of mushroom
    const directionX = mushroom.body.velocity.x > 0 ? 1 : (mushroom.body.velocity.x < 0 ? -1 : 0);
    if (directionX === 0) return false;

    // Create sensor in front of mushroom
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

// Make mushroom jump over obstacles
function mushroomJump(mushroom) {
    if (mushroomCanJump(mushroom)) {
        Body.setVelocity(mushroom.body, { x: mushroom.body.velocity.x, y: -12 });
    }
}

// AI system for mushroom enemies
function updateMushroomsAI() {
    if (!myGamePiece) return;
    const playerPos = myGamePiece.body.position;

    allComponents.forEach(comp => {
        if (comp.image.src.includes('mushroomMario.png')) {
            const mushroomPos = comp.body.position;

            // Calculate distance to player
            const visionRadius = 400;
            const dx = playerPos.x - mushroomPos.x;
            const dy = playerPos.y - mushroomPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If player is within vision range, chase them
            if (distance < visionRadius) {
                const speed = 3;
                const directionX = dx > 0 ? 1 : -1;

                Body.setVelocity(comp.body, { x: speed * directionX, y: comp.body.velocity.y });

                // Check if mushroom needs to jump over obstacles
                mushroomJump(comp);
            } else {
                // Stop moving if player is too far
                Body.setVelocity(comp.body, { x: 0, y: comp.body.velocity.y });
            }

            // Prevent mushroom rotation
            Body.setAngle(comp.body, 0);
            Body.setAngularVelocity(comp.body, 0);
        }
    });
}

// Initialize and start the game
function startGame() {
    myGameArea.start();
    myGameArea.engine.world.gravity.y = 3; // Set world gravity

    // Create all level components
    window.allComponents = createComponents();

    // Set up collision detection system
    Matter.Events.on(myGameArea.engine, "collisionActive", function (event) {
        const player = myGamePiece?.body;
        if (!player) return;

        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            
            // Find different types of sensors
            const sensor = [bodyA, bodyB].find(b => b.label === 'luckySensor');
            const sensorOfNamePlate = [bodyA, bodyB].find(b => b.label === 'nothing');
            const playerTouch = [bodyA, bodyB].find(b => b === player);

            // Get the other body in collision (not player)
            const otherBody = (bodyA === player) ? bodyB : (bodyB === player) ? bodyA : null;
            if (!otherBody) return;

            // Find component associated with collision body
            const comp = allComponents.find(c => c.body === otherBody);
            
            // Handle death void collision
            if (comp && comp.type === 'wvoid') {
                console.log("💀 Player fell into void!");
                World.remove(myGameArea.engine.world, myGamePiece.body);
                marioDeath();
                startMusic.pause();
                stopTimer();
                lostGame();
                return;
            }

            // Handle victory flag collision
            if (comp && comp.type === "flag") {
                if (scoreValue > 5000) {
                    console.log("You win!");
                    World.remove(myGameArea.engine.world, myGamePiece.body);
                    stopTimer();
                    startMusic.pause();
                    gameWin();
                    endOfGameMusic();
                } else {
                    alert("Mario n'est pas content de toi. Parce que tu ne l'as pas apporté 5000 pièces, tu dois tout recommencer depuis le début.");
                    // "Mario is not happy with you. Because you didn't bring him 5000 coins, you have to start over from the beginning."
                    location.reload();
                }
                
                // Push player back when touching flag
                const pushBackForce = 10.1;
                const angle = Math.atan2(myGamePiece.body.position.y - comp.body.position.y, myGamePiece.body.position.x - comp.body.position.x);
                const force = Matter.Vector.create(Math.cos(angle) * pushBackForce, Math.sin(angle) * pushBackForce);
                Matter.Body.applyForce(myGamePiece.body, myGamePiece.body.position, force);
            }

            // Handle lucky block sensor activation
            if (sensor && playerTouch) {
                const lucky = sensor.luckyBlock;
                if (lucky && !lucky.used) {
                    triggerLuckyBlock(lucky);
                }
            }

            // Handle info block sensor activation
            if (sensorOfNamePlate && playerTouch) {
                const tablichka = sensorOfNamePlate.nothing;
                if (tablichka && !tablichka.used) {
                    nameplate(tablichka);
                }
            }

            // Process collisions with all components
            for (let i = allComponents.length - 1; i >= 0; i--) {
                const comp = allComponents[i];

                if (comp.body === otherBody) {
                    // Check if player is standing on top of object
                    const playerBottom = player.position.y + myGamePiece.height / 2;
                    const blockTop = comp.body.position.y - comp.height / 2;

                    const standing = playerBottom <= blockTop + 5 && player.velocity.y >= 0;
                    if (standing) {
                        myGamePiece.isOnGround = true;
                    }

                    // Handle mushroom enemy collision
                    if (comp.image.src.includes('mushroomMario.png')) {
                        const playerBottom = player.position.y + myGamePiece.height / 2;
                        const playerTop = player.position.y - myGamePiece.height / 2;
                        const playerVelocityY = player.velocity.y;

                        const mushroomTop = comp.body.position.y - comp.height / 2;
                        const mushroomBottom = comp.body.position.y + comp.height / 2;

                        // If player jumps on mushroom from above
                        if (playerBottom <= mushroomTop + 5 && playerVelocityY > 0) {
                            // Destroy mushroom and award points
                            World.remove(myGameArea.engine.world, comp.body);
                            allComponents.splice(allComponents.indexOf(comp), 1);
                            scoreValue += 500;
                            let scoreElement = document.getElementById('score');
                            if (scoreElement) {
                                scoreElement.textContent = `Score: ${scoreValue}`;
                            }
                            console.log("🍄 Mushroom defeated from above!");
                        } else {
                            // Otherwise player dies
                            console.log("💀 Player killed by mushroom!");
                            World.remove(myGameArea.engine.world, myGamePiece.body);
                            marioDeath();
                            startMusic.pause();
                            stopTimer();
                            lostGame();
                        }
                    }

                    // Handle coin collection
                    if (comp.type === 'coin') {
                        World.remove(myGameArea.engine.world, comp.body);
                        allComponents.splice(i, 1);

                        // Play coin collection sound
                        const coinSound = new Audio("./sounds/mario-lucky-takes.mp3");
                        coinSound.volume = 0.25;
                        coinSound.play();

                        // Award points and update score display
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

// Start the game when page loads
window.onload = startGame;