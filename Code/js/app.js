try{
    function startGame() {
    myGamePiece = new component(50, 50, './images/playerMario.png', 110, 120);
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
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
          })
          window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
          })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = "./images/playerMario.png";
    this.speedX = 0;
    this.speedY = 0;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.height, this.width)
    }
    this.newPos = function(){
        this.x += this.speedX;
        this.y += this.speedY
    }
    this.update = function(){
        if(this.image.complete){
            myGameArea.context.drawImage(this.image, this.x, this.y, this.width, this.height)
        }
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -1; }
    if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = 1; }
    if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.speedY = -1; }
    if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.speedY = 1; }  
    myGamePiece.update();
    myGamePiece.newPos();
}
}
catch(error){
    console.log(error)
}























startGame();



























































console.log("dsdd")