//mardi, 25 mars 2025, 08:22:46. Tsybulevskyi Maksym
window.myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.id = "canvasStart";
        this.canvas.width = window.innerWidth * 0.75;
        this.canvas.height = 720;
        this.canvas.style.position = "absolute";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        this.interval = setInterval(window.updateGameArea, 1);

        // Initialize Matter.js physics engine
        this.engine = Engine.create();
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        this.keys = [];
        window.addEventListener('keydown', (e) => {
            this.keys[e.keyCode] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;
        });

        this.canvas.addEventListener('wheel', function (event) {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        });
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};
