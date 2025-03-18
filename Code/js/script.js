function hideButtonStart() {
    const hide = document.getElementById("hide")

    hide.style.transition = "opacity 1s ease";

    hide.style.opacity = "0";

    setTimeout(function () {

        hide.style.display = "none";
    }, 1000)
}

function openGameMario() {

    const canvasStart = document.getElementById("canvasStart")

    setTimeout(function (){
        canvasStart.style.display = "flex";
    },760)







}