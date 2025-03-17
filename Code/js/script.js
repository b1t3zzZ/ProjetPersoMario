function hideButtonStart() {
    const hide = document.getElementById("hide")

    hide.style.transition = "opacity 1s ease";

    hide.style.opacity = "0";

    setTimeout(function () {

        hide.style.display = "none";
    }, 1000)
}