//lundi, 17 mars 2025, 10:13:27. Tsybulevskyi Maksym

/**
 * Function responsible for hiding the START button when clicked
 * Provides smooth fade-out animation before completely hiding the button
 */
function hideButtonStart() {
    const hide = document.getElementById("hide");

    // Set smooth opacity transition for fade effect
    hide.style.transition = "opacity 1s ease";

    // Start fade-out by setting opacity to 0
    hide.style.opacity = "0";

    // After 1 second (when fade animation completes), completely hide the button
    setTimeout(function () {
        hide.style.display = "none";
    }, 1000);

    // Disable button to prevent multiple clicks during animation
    hide.disabled = true;
}

let timer = document.getElementById("timer"); // Timer display element
let interval;                                 // Reference to setInterval
let startTime;                                // Timer start time

/**
 * Starts the timer using accurate system time
 */
function startTimer() {
    startTime = Date.now(); // Store the start time
    updateTime();           // Immediately show 00:00

    interval = setInterval(updateTime, 1000); // Update every second
}

/**
 * Updates the timer by calculating elapsed time
 */
function updateTime() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000); // Elapsed seconds

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Stops the timer
 */
function stopTimer() {
    clearInterval(interval);
}

// Audio objects for game sounds
const endOfGame = new Audio("./sounds/konec-igry-mar.mp3");  // End game music
const startMusic = new Audio("./sounds/debutMario.mp3");     // Background game music

// Initialize timer update (Note: This line may cause issues as it immediately calls updateTime)
window.update = updateTime();

/**
 * Function that opens the game canvas when "START" is pressed
 * Handles the transition from menu to game with proper timing
 * Starts background music and timer after a delay
 */
function openGameMario() {
    const canvasStart = document.getElementById("canvasStart");

    // Delay execution by 760ms to sync with button hide animation
    setTimeout(function () {
        // Show the game canvas
        canvasStart.style.display = "flex";

        // Configure and start background music
        startMusic.volume = 0.1;                        // Set volume to 10%
        startMusic.loop = true;                         // Enable music looping
        startMusic.play();                              // Start playing music

        console.log("openGameMario function called");

        // Start the game timer (updates every second)
        startTimer();

    }, 760);
}

/**
 * Play the end-of-game victory music
 * Called when player successfully completes the game
 */
function endOfGameMusic() {
    endOfGame.volume = 0.2;                             // Set volume to 20%
    endOfGame.play();                                   // Play victory music
}

/**
 * Display the game over screen
 * Hides the game canvas and shows the "lost game" modal
 */
function lostGame() {
    const restartLost = document.getElementById("lostGame");     // Game over modal
    const canvasStart = document.getElementById("canvasStart");  // Game canvas

    // Hide game canvas and show game over screen
    canvasStart.style.display = "none";
    restartLost.style.display = "block";
}

/**
 * Play Mario death sound effect
 * Called when player character dies in the game
 */
function marioDeath() {
    const death = new Audio("./sounds/marioDeath.mp3");
    death.volume = 0.2;                                 // Set volume to 20%
    death.play();                                       // Play death sound
}

/**
 * Display the victory screen
 * Hides the game canvas and shows the "game won" screen
 */
function gameWin() {
    const gameWin = document.getElementById("gameWin");         // Victory screen
    const canvasStart = document.getElementById("canvasStart"); // Game canvas

    // Hide game canvas and show victory screen
    canvasStart.style.display = "none";
    gameWin.style.display = "flex";
}

/**
 * Restart the entire game
 * Reloads the page to reset all game state
 */
function restartGame() {
    location.reload();                                  // Reload page to restart game
}

/**
 * End the game and show thank you screen
 * Triggered when player chooses "No" on the game over screen
 */
function endGame() {
    const endGameMario = document.getElementById("end");        // Thank you screen
    const restartLost = document.getElementById("lostGame");    // Game over modal

    console.log("'No' button pressed");                         // Debug log

    // Hide game over modal and show thank you screen
    endGameMario.style.display = "flex";
    restartLost.style.display = "none";
}
