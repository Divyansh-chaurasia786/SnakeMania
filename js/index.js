// Game Constants & Variables
let inputDir = { x: 0, y: 0 };
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');
let baseSpeed = window.innerWidth < 768 ? 5 : 8;  // Slower initial speeds
let speed = baseSpeed;
let maxSpeed = window.innerWidth < 768 ? 15 : 20; // Lower maximum speeds
let lastPaintTime = 0;
let score = 0;
let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };
let gameStarted = false;

// Adjust audio volumes
foodSound.volume = 0.5;
moveSound.volume = 0.2;
musicSound.volume = 0.3;

// Game Functions
function main(ctime) {
    window.requestAnimationFrame(main);
    if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}

function isCollide(snake) {
    // If you bump into yourself 
    for (let i = 1; i < snakeArr.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    // If you bump into the wall
    if (snake[0].x >= 19 || snake[0].x <= 0 || snake[0].y >= 19 || snake[0].y <= 0) {
        return true;
    }
    return false;
}

function updateSpeedDisplay() {
    const speedMultiplier = (speed / baseSpeed).toFixed(1);
    document.getElementById('speedBox').innerHTML = `Speed: ${speedMultiplier}x`;
}

function gameEngine() {
    // Part 1: Updating the snake array & Food
    if (isCollide(snakeArr)) {
        gameOverSound.play();
        musicSound.pause();
        inputDir = { x: 0, y: 0 };
        alert("Game Over. Press any key to play again!");
        snakeArr = [{ x: 13, y: 15 }];
        musicSound.play();
        score = 0;
        speed = baseSpeed;
        updateSpeedDisplay();
        gameStarted = false;
        scoreBox.innerHTML = "Score: " + score;
        return;
    }

    // If you have eaten the food
    if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
        foodSound.play();
        score += 1;
        
        // More gradual speed increase
        speed = Math.min(baseSpeed + Math.floor(score / 6), maxSpeed);
        updateSpeedDisplay();
        
        if (score > hiscoreval) {
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
        }
        scoreBox.innerHTML = "Score: " + score;
        snakeArr.unshift({ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y });
        let a = 2;
        let b = 16;
        food = {
            x: Math.round(a + (b - a) * Math.random()),
            y: Math.round(a + (b - a) * Math.random())
        };
    }

    // Moving the snake
    if (gameStarted) {
        for (let i = snakeArr.length - 2; i >= 0; i--) {
            snakeArr[i + 1] = { ...snakeArr[i] };
        }

        snakeArr[0].x += inputDir.x;
        snakeArr[0].y += inputDir.y;
    }

    // Part 2: Display the snake and Food
    board.innerHTML = "";
    snakeArr.forEach((e, index) => {
        let snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;
        snakeElement.classList.add(index === 0 ? 'head' : 'snake');
        board.appendChild(snakeElement);
    });

    // Display the food
    let foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    board.appendChild(foodElement);
}

// Handle keyboard controls
function handleKeyPress(e) {
    if (!gameStarted) {
        gameStarted = true;
    }
    
    moveSound.play();
    switch (e.key) {
        case "ArrowUp":
            if (inputDir.y !== 1) {
                inputDir.x = 0;
                inputDir.y = -1;
            }
            break;
        case "ArrowDown":
            if (inputDir.y !== -1) {
                inputDir.x = 0;
                inputDir.y = 1;
            }
            break;
        case "ArrowLeft":
            if (inputDir.x !== 1) {
                inputDir.x = -1;
                inputDir.y = 0;
            }
            break;
        case "ArrowRight":
            if (inputDir.x !== -1) {
                inputDir.x = 1;
                inputDir.y = 0;
            }
            break;
    }
}

// Handle touch controls
let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    evt.preventDefault();

    if (!gameStarted) {
        gameStarted = true;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;
    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            if (inputDir.x !== 1) {
                inputDir.x = -1;
                inputDir.y = 0;
            }
        } else {
            if (inputDir.x !== -1) {
                inputDir.x = 1;
                inputDir.y = 0;
            }
        }
    } else {
        if (yDiff > 0) {
            if (inputDir.y !== 1) {
                inputDir.x = 0;
                inputDir.y = -1;
            }
        } else {
            if (inputDir.y !== -1) {
                inputDir.x = 0;
                inputDir.y = 1;
            }
        }
    }

    moveSound.play();
    xDown = null;
    yDown = null;
}

// Initialize game
musicSound.play().catch(error => {
    console.log("Audio autoplay was prevented. Please interact with the page first.");
});

let hiscore = localStorage.getItem("hiscore");
let hiscoreval = hiscore === null ? 0 : JSON.parse(hiscore);
hiscoreBox.innerHTML = "HiScore: " + hiscoreval;

// Event Listeners
window.addEventListener('keydown', handleKeyPress);
window.addEventListener('touchstart', handleTouchStart, false);
window.addEventListener('touchmove', handleTouchMove, false);
window.addEventListener('resize', () => {
    baseSpeed = window.innerWidth < 768 ? 5 : 8;
    maxSpeed = window.innerWidth < 768 ? 15 : 20;
    speed = baseSpeed + Math.floor(score / 6);
    speed = Math.min(speed, maxSpeed);
    updateSpeedDisplay();
});

// Initialize speed display
updateSpeedDisplay();

// Start the game loop
window.requestAnimationFrame(main);