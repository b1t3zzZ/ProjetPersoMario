//lundi, 17 mars 2025, 10:13:27. Tsybulevskyi Maksym

//Функция отвечающая за исчезание кнопки при нажатии
function hideButtonStart() {
    const hide = document.getElementById("hide")

    hide.style.transition = "opacity 1s ease";

    hide.style.opacity = "0";

    setTimeout(function () {

        hide.style.display = "none";
    }, 1000)
}

let timer = document.getElementById("timer");
let startBtn = document.getElementById("startBtn");

let miliseconds = 0;
let seconds = 0;
let minutes = 0;
let interval;
//Функция для запуска таймера
function updateTime(){
    miliseconds++;
    if (miliseconds === 100){
        seconds++;
        miliseconds = 0;
    }
    if(seconds === 60){
        minutes++;
        seconds = 0;
    }
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${miliseconds.toString().padStart(2, '0')}`;

}

//Функция открывающая окно Canvas при нажатии "START" на главном экране + начало музыки после 0.76 с + начало таймера
function openGameMario() {

    const canvasStart = document.getElementById("canvasStart")

    setTimeout(function () {
        canvasStart.style.display = "flex";


        const startMusic = new Audio("./sounds/debutMario.mp3")
        startMusic.volume = 0.1;
        startMusic.loop = true;
        startMusic.play();

        interval = setInterval(updateTime, 10);
    }, 760)

    
}

