// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, color, collideRectRect, colorMode, createCanvas, fill, frameRate, keyCode, height,
 *    loop, noFill, noLoop, noStroke, random, rect, round, stroke, sqrt, text, width
 *    UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW
 */

// Solution: Version 1 (this is what we went through in Code Along)

let backgroundColor, playerSnake, currentApple, score;

function setup() {
  // Canvas & color settings
  createCanvas(400, 400);
  colorMode(HSB, 360, 100, 100);
  backgroundColor = 95;
  frameRate(12);
  
  // Create Snake and Apple objects
  playerSnake = new Snake();
  currentApple = new Apple();
  
  // Initialize score to 0
  score = 0;
}

function draw() {
  background(backgroundColor);
  // The snake performs the following four methods:
  playerSnake.moveSelf();
  playerSnake.showSelf();
  playerSnake.checkCollisions();
  playerSnake.checkApples();
  // The apple needs fewer methods to show up on screen
  currentApple.showSelf();
  // We put the score in its own function for readability
  displayScore();
}

function displayScore() {
  fill(0);
  text(`Score: ${score}`, 20, 20);
}

class Snake {
  constructor() {
    this.size = 10;
    this.x = width/2; // Starts in the middle of the screen horizontally
    this.y = height - 10; // Starts 10 away from the bottom vertically
    this.direction = 'N'; // Initial direction the snake is moving in (north)
    this.speed = 12;
  }

  // Use the direction property to determine which direction to move the snake in
  moveSelf() {
    if (this.direction === "N") {
      this.y -= this.speed;
    } else if (this.direction === "S") {
      this.y += this.speed;
    } else if (this.direction === "E") {
      this.x += this.speed;
    } else if (this.direction === "W") {
      this.x -= this.speed;
    } else {
      console.log("Error: invalid direction");
    }
  }

  // Display the snake as a rect
  showSelf() {
    stroke(240, 100, 100);
    noFill();
    rect(this.x, this.y, this.size, this.size);
    noStroke();
  }

  // Check if there has been a collision between the snake and apple
  checkApples() {
    // If the head of the snake collides with the apple...
    if (collideRectRect(this.x, this.y, this.size, this.size,
        currentApple.x, currentApple.y, currentApple.size, currentApple.size)) {
      score += 1; // Increment the score
      // Update our apple to a new apple (with a new random position)
      currentApple = new Apple(); 
    }
  }

  checkCollisions() {
    // TODO for v2
  }

  extendTail() {
     // TODO for v2
  }
}


class Apple {
  constructor() {
    this.x = round(random(width - 10));
    this.y = round(random(height - 10));
    this.size = 10;
  }

  showSelf() {
    fill(0, 80, 80);
    rect(this.x, this.y, this.size, this.size);
  }
}

function keyPressed() {
  console.log("key pressed: ", keyCode);
  if (keyCode === UP_ARROW && playerSnake.direction != 'S') {
    playerSnake.direction = "N";
  } else if (keyCode === DOWN_ARROW && playerSnake.direction != 'N') {
    playerSnake.direction = "S";
  } else if (keyCode === RIGHT_ARROW && playerSnake.direction != 'W') {
    playerSnake.direction = "E";
  } else if (keyCode === LEFT_ARROW && playerSnake.direction != 'E') {
    playerSnake.direction = "W";
  } else {
    console.log("wrong key");
  }
  
   // TODO for v2: restart game when space bar is pressed
}

function restartGame() {
   // TODO for v2
}

function gameOver() {
   // TODO for v2
}