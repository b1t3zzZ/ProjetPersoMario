const levelMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

];


const blockSize = 50;

function drawLevel() {
    for (let row = 0; row < levelMap.length; row++) {
        for (let col = 0; col < levelMap[row].length; col++) {
            const tile = levelMap[row][col];

            switch (tile) {
                case 1: // Блок
                    myGameArea.context.fillStyle = "./images/beton.png"; // Цвет блока
                    myGameArea.context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                    break;
                case 2: // Платформа
                    myGameArea.context.fillStyle = "./images/beton.png"; // Цвет платформы
                    myGameArea.context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                    break;
                case 0: // Пустое место
                    break; // Пустое место, ничего не рисуем
            }
        }
    }
}




function startGame() {
    myGamePiece = new component(50, 50, './images/playerMario.png', 194, 507);
    myGameArea.start();
}

const myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.id = "canvasStart";
        this.canvas.width = window.innerWidth * 0.75;
        this.canvas.height = window.innerHeight * 0.75;
        this.canvas.style.justifyContent = "center";
        this.canvas.style.alignItems = "center";
        this.canvas.style.boxSizing = "border-box";
        this.canvas.style.position = "absolute";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);

        this.keys = [];

        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        });

        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        });

        this.canvas.addEventListener('wheel', function (event) {
            // Проверяем, была ли нажата клавиша Ctrl
            if (event.ctrlKey) {
                // Отменяем стандартное поведение (увеличение/уменьшение)
                event.preventDefault();
            }
        });
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function component(width, height, imageSrc, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageSrc;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.1;
    this.gravitySpeed = 0;
    this.jumpStrenght = -15;

    // Обновление компонента, рисуем изображение
    this.update = function () {
        if (this.image.complete) {
            myGameArea.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    };

    // Перемещение компонента
    this.newPos = function () {
        this.x += this.speedX;
        this.gravitySpeed += this.gravity;
        this.y += this.speedY + this.gravitySpeed;

        this.hitSides();
        this.checkCollisionWithLevel();
    };

    this.checkCollisionWithLevel = function () {

    }


    //Не дать упасть вниз
    this.hitSides = function () {
        const rockbottom = myGameArea.canvas.height - this.height
        const rocksides = myGameArea.canvas.width - this.width;
        if (this.x > rocksides) {
            this.x = rocksides;
        }

        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        }

    }
}


this.jump = function () {
    if (this.gravitySpeed === 0) {
        this.gravitySpeed = this.jumpStrenght;
    }
}


function updateGameArea() {
    myGameArea.clear();
    drawLevel();
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;

    // Управление движением
    if (myGameArea.keys && myGameArea.keys[37]) { myGamePiece.speedX = -15; }  // Влево
    if (myGameArea.keys && myGameArea.keys[39]) { myGamePiece.speedX = 15; }   // Вправо
    if (myGameArea.keys && myGameArea.keys[38]) { myGamePiece.speedY = jump(); }  // Вверх
    if (myGameArea.keys && myGameArea.keys[40]) { myGamePiece.speedY = 15; }   // Вниз


    myGamePiece.update();
    myGamePiece.newPos();
}

startGame();