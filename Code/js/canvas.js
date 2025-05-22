//mardi, 25 mars 2025, 08:22:46. Tsybulevskyi Maksym

/**
 * Main game area object - manages canvas, rendering, physics, and input
 * This is the core system that handles the game's visual and interactive components
 */
window.myGameArea = {
    // Create the main game canvas element
    canvas: document.createElement("canvas"),
    
    /**
     * Initialize the game area and all its systems
     * Sets up canvas, physics engine, input handling, and game loop
     */
    start: function () {
        // Configure canvas properties
        this.canvas.id = "canvasStart";                           // Set canvas ID for CSS targeting
        this.canvas.width = window.innerWidth * 0.745;           // Set width to 74.5% of viewport width
        this.canvas.height = window.innerHeight * 0.74;          // Set height to 74% of viewport height
        this.canvas.style.position = "absolute";                 // Position canvas absolutely for overlay
        
        // Get 2D rendering context for drawing operations
        this.context = this.canvas.getContext("2d");
        
        // Insert canvas at the beginning of the document body
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // Start the main game loop - calls updateGameArea every 10ms (100 FPS)
        this.interval = setInterval(window.updateGameArea, 10);

        // Initialize Matter.js physics engine
        this.engine = Engine.create();                           // Create physics engine instance
        this.runner = Runner.create();                           // Create physics runner for automatic updates
        Runner.run(this.runner, this.engine);                   // Start the physics simulation

        // Initialize input handling system
        this.keys = [];                                          // Array to track pressed keys
        
        // Keyboard event listeners for player input
        window.addEventListener('keydown', (e) => {
            this.keys[e.keyCode] = true;                         // Mark key as pressed
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;                        // Mark key as released
        });

        // Prevent browser zoom when Ctrl+scroll is used on canvas
        // This ensures consistent game experience without accidental zooming
        this.canvas.addEventListener('wheel', function (event) {
            if (event.ctrlKey) {
                event.preventDefault();                          // Block Ctrl+scroll zoom
            }
        });
    },

    /**
     * Clear the entire canvas for the next frame
     * Called at the beginning of each game loop iteration
     */
    clear: function () {
        // Clear the entire canvas area with transparent pixels
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};