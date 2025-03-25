//Функция отвечающая за исчезание кнопки при нажатии
function hideButtonStart() {
    const hide = document.getElementById("hide")

    hide.style.transition = "opacity 1s ease";

    hide.style.opacity = "0";

    setTimeout(function () {

        hide.style.display = "none";
    }, 1000)
}

//Функция открывающая окно Canvas при нажатии "START" на главном экране + начало музыки после 0.76 м/с
function openGameMario() {

    const canvasStart = document.getElementById("canvasStart")

    setTimeout(function () {
        canvasStart.style.display = "flex";

        const startMusic = new Audio("./sounds/debutMario.mp3")
        startMusic.volume = 0.15;
        startMusic.loop = true;
        startMusic.play();
    }, 760)







}