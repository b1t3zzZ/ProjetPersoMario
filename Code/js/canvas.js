//Запуск игры
function startGame() {
    myGamePiece = new component(35, 55, './images/playerMario.png', 194, 507);
    myGameArea.start();
}


//Canvas окно
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
        this.interval = setInterval(updateGameArea, 10);

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
//Функция по созднанию объекта
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
    this.jumpStrenght = -15;
    this.backdown = 0;
    this.isJumping = false;
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
    };

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
            this.isJumping = false;
        }

        if (this.x < 0) {
            this.x = 0;
        }
    }


//Прыжок с звуко сопровождением
    this.jump = function () {
        const marioJump = new Audio("./sounds/mario-jump.mp3")
        marioJump.volume = 0.4;

        if (!this.isJumping) {
            this.gravitySpeed = this.jumpStrenght;
            this.isJumping = true;

            if (!marioJump.paused) {
                marioJump.currentTime = 0; // Перематываем звук на начало
            }
            marioJump.play();
        }
    }
}

//Обновление площади и назначение кнопок
function updateGameArea() {
    myGameArea.clear();

    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;

    // Управление движением
    if (myGameArea.keys && myGameArea.keys[37]) { myGamePiece.speedX = -7; }  // Влево
    if (myGameArea.keys && myGameArea.keys[39]) { myGamePiece.speedX = 7; }   // Вправо
    if (myGameArea.keys && myGameArea.keys[38]) { myGamePiece.jump(); }  // Прыжок (вверх)
    if (myGameArea.keys[37] && myGameArea.keys[39]) { myGamePiece.speedX = 0; }//Если нажаты две - то остановка

    myGamePiece.update();
    myGamePiece.newPos();
}

//Запуск игры
startGame();