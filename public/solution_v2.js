// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, color, collideRectRect, colorMode, createCanvas, fill, frameRate, keyCode, height,
 *    loop, noFill, noLoop, noStroke, random, rect, round, stroke, sqrt, text, width, createButton,
 *    UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, ml5, textSize, strokeWeight, collidePointTriangle,
 *    BACKSPACE, triangle,
 */

let backgroundColor,
  playerSnake, currentApple, score,
  lives, level1, level2, level3,
  button1, button2, button3,
  power, power2, obs,
  time, counter,
  gameIsOver,
  home;
let label = "listening...";
let classifier;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/aaRjZ9wBL/";

classifier = ml5.soundClassifier(`${imageModelURL}model.json`);

let id;

function setup() {
  createCanvas(500, 500);
  colorMode(HSB, 360, 100, 100);
  backgroundColor = 95;
  frameRate(6);

  classifier.classify(gotResult); // voice control
  socket = io.connect('https://cssi-snakes.herokuapp.com/'); // add web socket 'http://localhost:3000' 

  playerSnake = new Snake();
  let data = {
    x: playerSnake.x,
    y: playerSnake.y,
    size: playerSnake.size,
    direction: playerSnake.direction,
    speed: playerSnake.speed,
    tail: playerSnake.tail,
  };
  socket.emit("start", data);

  socket.on("heartbeat", function (data) {
    //console.log(data);
    snakes = data;
  });

  //level 1 button
  button1 = createButton("Level 1 - EASY");
  button1.position(230, 230);
  button1.mousePressed(levelOne);

  // level 2 button
  button2 = createButton("Level 2 - MEDIUM");
  button2.position(220, 260);
  button2.mousePressed(levelTwo);

  //level 3 button
  button3 = createButton("Level 3 - HARD");
  button3.position(230, 290);
  button3.mousePressed(levelThree);

  //create  an apple
  currentApple = new Apple();

  //create power ups
  power = [];
  for (let i = 0; i < 1; i++) {
    let p = new PowerUpTime();
    power.push(p);
  }

  //create power ups
  power2 = [];
  for (let i = 0; i < 1; i++) {
    let p2 = new PowerUpResetLives();
    power2.push(p2);
  }

  //create obstacles
  obs = [];
  for (let i = 0; i < 1; i++) {
    let o = new Obstacle();
    obs.push(o);
  }

  gameIsOver = false;
  score = 0;
  lives = 5;
  time = 0;
  counter = 3;

  home = true;
  level1 = false;
  level2 = false;
  level3 = false;
}

function draw() {
  background(backgroundColor);

  // set the home screen
  if (home) {
    homeScreen();
  } else if (!home) {
    playerSnake.moveSelf();
    playerSnake.showSelf();
    playerSnake.checkCollisions();
    playerSnake.checkApples();

    /*for (let i = snakes.length - 1; i >= 0; i--) {
      let id = snakes[i].id;
      if (id.substring(2, id.length) !== socket.id) stroke(240, 100, 100);
      noFill();
      rect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
      noStroke();*/

      for (let i = 0; i < snakes.length; i++){
        let id = snakes[i].id
        if (id.substring(2, id.length) !== socket.id)
          stroke(240, 100, 100);
          fill(106, 100, 100);
          rect(snakes[i].x, snakes[i].y, snakes[i].size, snakes[i].size);
          snakes[i].tail = [new TailSegment(snakes[i].x, snakes[i].y)];
            for (let i = 0; i < playerSnake.tail.length; i++) {
              playerSnake.tail[i].showSelf();
          }
        //}
        //let lastTailSegment = snakes[i].tail[snakes[i].tail.length - 1];
      //  snakes[i].tail.push(new TailSegment(lastTailSegment.x, lastTailSegment.y));

      let data = {
        x: playerSnake.x,
        y: playerSnake.y,
        size: playerSnake.size,
        direction: playerSnake.direction,
        speed: playerSnake.speed,
        tail: playerSnake.tail,
      };

      socket.emit("update", data);
    if (time>= 10 && playerSnake.x == snakes[i].x && playerSnake.y == snakes[i].y) {
        gameOver();
      }
      /*if (time>= 10 && snakes[i].x == playerSnake.x && snakes[i].y == playerSnake.y) {
        score ++;
        text('Opponent! +1', snakes[i].x, snakes[i].y)
      }*/
    }
      currentApple.showSelf();
      displayText();
      displayNoise();
      handleTime();
      if (level1 || level2) {
        powerAndObs();
      } else if (level3) {
        mazeCreation();
      }

    // when to win game
    if (lives > 0 && score >= 10 && counter > 0) {
      fill(random(360), 50, 100);
      winGame();
    }

    //when to lose game
    if (lives <= 0 || gameIsOver || counter < 0 || time >= 1000) {
      gameOver();
      gameIsOver = false;
      counter = 3;
    }
  }
}

function levelOne() {
  level1 = true;
  home = false;
  button1.position(0 - 200, 0);
  button2.position(0 - 200, 0);
  button3.position(0 - 200, 0);
}

function levelTwo() {
  level2 = true;
  home = false;
  button1.position(0 - 200, 0);
  button2.position(0 - 200, 0);
  button3.position(0 - 200, 0);
}

function levelThree() {
  level3 = true;
  home = false;
  button1.position(0 - 200, 0);
  button2.position(0 - 200, 0);
  button3.position(0 - 200, 0);
}
// set the home screen
function homeScreen() {
  fill(120, 100, 20);
  rect(0, 0, width, height);
  textSize(60);
  fill(random(360), 100, 100);
  stroke(0);
  strokeWeight(12);
  text("SNAKE GAME", 50, 70);
  noStroke();
  strokeWeight(2);
  textSize(12);

  fill(0);
  rect(70, 100, 40);
  rect(115, 100, 40);
  rect(160, 100, 40);
  rect(205, 100, 40);
  rect(250, 100, 40);
  rect(295, 100, 40);
  rect(340, 100, 40);
  rect(385, 100, 40);

  fill(0, 100, 100);
  textSize(20);
  text(" CHOOSE A LEVEL", 160, 180);
  textSize(12);
  fill(100);
  text("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", 10, height - 200 );
  text("Press the SPACE bar to restart current level", 140, height - 180);
  text("Press the SPACE bar then the BACKSPACE bar to restart game and return to this page", 17, height - 160);
  text("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", 10, height - 140);
  text("*** FOR LEVELS 1 & 2 ***", 180, height - 120);
  text("Bright colorful squares are powerups used to increase score by 2", 75, height - 100);
  text("Bright colorful triangles are powerups used to reset lives back to 5", 75, height - 80);
  text("Dim colorful rectangles that are differently shaped are obstacles that reset score back to 0", 10, height - 60);
  text("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", 10, height - 40);
  text("*** FOR LEVEL 3 ***", 195, height - 25);
  text("If you collide with the maze lines 3 times, the game will be over", 85, height - 10);
}
// create the maze + check collisions
function mazeCreation(){

  fill(0);
  rect1 = rect(250, 0, 3, 180);
  rect2 = rect(80, 180, 250, 3);
  rect3 = rect(80, 100, 75, 3);
  rect4 = rect(80, 100, 3, 80);
  rect5 = rect(165, 180, 3, 80);
  rect6 = rect(330, 180, 3, 80);
  rect7 = rect(250, 260, 83, 3);
  rect8 = rect(250, 260, 3, 80);
  rect9 = rect(80, 340, 173, 3);
  rect10 = rect(0, 250, 80, 3);
  rect11 = rect(340, 350, 3, 150);
  rect12 = rect(80, 420, 264, 3);
  rect13 = rect(420, 150, 80, 3);
  rect14 = rect(330, 80, 89, 3);
  rect15 = rect(419, 80, 3, 73);
  rect16 = rect(420, 400, 80, 3);
  rect17 = rect(420, 260, 3, 144);

  hitRect1 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 250, 0, 3, 180);
  hitRect2 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 80, 180, 250, 3);
  hitRect3 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 80, 100, 75, 3);
  hitRect4 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 80, 100, 3, 80);
  hitRect5 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 165, 180, 3, 80);
  hitRect6 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 330, 180, 3, 80);
  hitRect7 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 250, 260, 83, 3);
  hitRect8 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 250, 260, 3, 80);
  hitRect9 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 80, 340, 173, 3);
  hitRect10 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 0, 250, 80, 3);
  hitRect11 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 340, 350, 3, 150);
  hitRect12 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 80, 420, 264, 3);
  hitRect13 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 420, 150, 80, 3);
  hitRect14 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 330, 80, 89, 3);
  hitRect15 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 419, 80, 3, 73);
  hitRect16 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 420, 400, 80, 3);
  hitRect17 = collideRectRect(playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size, 420, 260, 3, 144);

  if(hitRect1 || hitRect2 || hitRect3 || hitRect4 || hitRect5 || hitRect6 || hitRect7 || hitRect8 || hitRect9
     || hitRect10 || hitRect11 || hitRect12 || hitRect13 || hitRect14 || hitRect15 || hitRect16 || hitRect17){
    restartGame();
    counter--;
  }
}

//display scores
function displayText() {
  fill(0);
  text(`Your score is: ${score}`, 5, 15);
  if (level1 || level2) {
    text(`You have ${lives} lives left`, 5, 30);
  } else if (level3) {
    text(`You have ${counter} lives left`, 5, 30);
  }
}
//display noise inputs
function displayNoise() {
  fill(0);
  text("*" + label + "*", 5, height - 4);
}
//get noise inputs
function gotResult(error, results) {
  if (error) {
    console.error("error");
    return;
  }
  label = results[0].label;
  controlSnake();
}

// voice control of the snake
function controlSnake() {
  if (label === "Up" && playerSnake.direction != "S") {
    playerSnake.direction = "N";
  } else if (label === "Down" && playerSnake.direction != "N") {
    playerSnake.direction = "S";
  } else if (label === "Right" && playerSnake.direction != "W") {
    playerSnake.direction = "E";
  } else if (label === "Left" && playerSnake.direction != "E") {
    playerSnake.direction = "W";
  }
}

// track the time per level
function handleTime() {
  fill(color(20, 100, 100));
  text(`Time taken in this level: ${time}`, 150, 20);
  time++;
}

function powerAndObs() {
  for (let powers of power) {
    // create rectangle power up objects
    powers.move();
    powers.display();

    //level 1 power up: more time
    if (level1) {
      let scoreInc = collideRectRect(powers.x, powers.y, 15, 15, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
      if (scoreInc) {
        if (time > 200) {
          time -= 200;
        } else {
          time = 0;
        }
        //change the x and y variable of the time power
        powers.x = random(width);
        powers.y = random(height);
      }
    }
    //level 2 power up: more time (power ups are smaller)
    else if (level2) {
      let scoreInc = collideRectRect(powers.x, powers.y, 7, 7, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
      if (scoreInc) {
        if (time > 200) {
          time -= 200;
        } else {
          time = 0;
        }
        //change the x and y variable of the time power
        powers.x = random(width);
        powers.y = random(height);
      }
    }
  }

  for (let powers2 of power2) {
    // create triangle power up objects
    powers2.move();
    powers2.display();

    let livesReset1 = collidePointTriangle(playerSnake.x, playerSnake.y, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset2 = collidePointTriangle(playerSnake.x + playerSnake.size, playerSnake.y, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset3 = collidePointTriangle(playerSnake.x, playerSnake.y + playerSnake.size, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset4 = collidePointTriangle(playerSnake.x + playerSnake.size, playerSnake.y + playerSnake.size, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);

    if (level1) {
      if (livesReset1 || livesReset2 || livesReset3 || livesReset4) {
        // reset lives = 5, randomize powerup position
        lives = 5;
        powers2.x1 = random(width);
        powers2.y1 = random(height);
        powers2.x2 = powers2.x1 + 8;
        powers2.y2 = powers2.y1 + 16;
        powers2.x3 = powers2.x1 - 8;
        powers2.y3 = powers2.y1 + 16;
      }
    } else if (level2) {
      if (livesReset1 || livesReset2 || livesReset3 || livesReset4) {
        // reset lives = 5, randomize smaller powerup position
        lives = 5;
        powers2.x1 = random(width);
        powers2.y1 = random(height);
        powers2.x2 = powers2.x1 + 5;
        powers2.y2 = powers2.y1 + 10;
        powers2.x3 = powers2.x1 - 5;
        powers2.y3 = powers2.y1 + 10;
      }
    }
  }

  for (let theObs of obs) {
    // create the obstacles
    theObs.move();
    theObs.display();

    let scoreInc = collideRectRect(theObs.x, theObs.y, theObs.rectWidth, theObs.rectHeight, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);

    if (level1) {
      // decrease score to 0, randomize
      if (scoreInc) {
        score = 0;
        theObs.x = random(width);
        theObs.y = random(height);
        theObs.rectWidth = random(10, 16);
        theObs.rectHeight = random(5, 10);
      }
    } else if (level2) {
      // decrease score to 0, randomize --> bigger obstacles
      if (scoreInc) {
        score = 0;
        theObs.x = random(width);
        theObs.y = random(height);
        theObs.rectWidth = random(25, 40);
        theObs.rectHeight = random(20, 30);
      }
    }
  }
}

function keyPressed() {
  // key controls for player Snake (playaer 1)
  if (keyCode === UP_ARROW && playerSnake.direction != "S") {
    playerSnake.direction = "N";
  } else if (keyCode === DOWN_ARROW && playerSnake.direction != "N") {
    playerSnake.direction = "S";
  } else if (keyCode === RIGHT_ARROW && playerSnake.direction != "W") {
    playerSnake.direction = "E";
  } else if (keyCode === LEFT_ARROW && playerSnake.direction != "E") {
    playerSnake.direction = "W";
  } else if (keyCode === 32) {
    // reset to level __
    restartGame();
  } else if (keyCode === BACKSPACE) {
    // reset to homescreen
    home = true;
    gameIsOver = false;
    level1 = false;
    level2 = false;
    level3 = false;
    button1.position(230, 230);
    button2.position(220, 260);
    button3.position(230, 290);
  }
}

function restartGame() {
  score = 0;
  lives = 5;
  time = 0;
  playerSnake = new Snake();
  currentApple = new Apple();
  loop();
}

function gameOver() {
  gameIsOver = true;
  stroke(0);
  fill(250, 100, 20);
  rect(0, 0, width, height);
  fill(100);
  textSize(50);
  text("GAME OVER", 90, 150);
  text(`Final Score: ${score}`, 90, 210);
  textSize(12);
  text("Press the SPACE bar to restart current level", 140, height - 180);
  text("Press the SPACE bar then the BACKSPACE bar to restart game and return to this page", 17, height - 160);
  noLoop();
}

function winGame() {
  rect(0, 0, width, height);
  textSize(50);
  fill(100);
  text("YOU WIN!", 125, 150);
  textSize(12);
  text("Try to win in another level", 172, height - 200);
  text("Press the SPACE bar to restart current level", 140, height - 180);
  text("Press the SPACE bar then the BACKSPACE bar to restart game and return to this page", 17, height - 160);
}

class Snake {
  constructor() {
    this.size = 10;
    this.x = width / 2;
    this.y = height - this.size;
    this.direction = "N";
    this.speed = 12;
    this.tail = [new TailSegment(this.x, this.y)];
  }

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
    this.tail.unshift(new TailSegment(this.x, this.y));
    this.tail.pop();
  }

  showSelf() {
    stroke(240, 100, 100);
    noFill();
    rect(this.x, this.y, this.size, this.size);
    noStroke();
    for (let i = 0; i < this.tail.length; i++) {
      this.tail[i].showSelf();
    }
  }

  checkApples() {
    if (collideRectRect(this.x, this.y, this.size, this.size, currentApple.x, currentApple.y, currentApple.size, currentApple.size)) {
      score += 1;
      currentApple = new Apple();
      this.extendTail();
    }
    if (level2) {
      if (time % 40 == 0) {
        currentApple = new Apple();
      }
    }
  }

  checkCollisions() {
    //collisions with the canvas borders
    if (this.y >= height) {
      lives--;
      counter--;
      this.y = this.size;
      this.direction = "S";
      currentApple = new Apple();
    }
    if (this.y <= 0) {
      lives--;
      counter--;
      this.y = height - this.size;
      this.direction = "N";
      currentApple = new Apple();
    }
    if (this.x >= width) {
      lives--;
      counter--;
      this.x = this.size;
      this.direction = "E";
      currentApple = new Apple();
    }
    if (this.x <= 0) {
      lives--;
      counter--;
      this.x = width - this.size;
      this.direction = "W";
      currentApple = new Apple();
    }

    //collision of snake with itself
    if (this.tail.length > 2) {
      for (let i = 1; i < this.tail.length; i++) {
        if (this.x == this.tail[i].x && this.y == this.tail[i].y) {
          gameIsOver = true;
        }
        //text(i, this.tail[i].x, this.tail[i].y);
      }
    }
  }

  extendTail() {
    let lastTailSegment = this.tail[this.tail.length - 1];
    this.tail.push(new TailSegment(lastTailSegment.x, lastTailSegment.y));
  }
}

class TailSegment {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
  }

  showSelf() {
    fill(0);
    rect(this.x, this.y, this.size, this.size);
  }
}

class Apple {
  constructor() {
    this.x = round(random(width - 10));
    this.y = round(random(height - 10));
    this.size = 15;
  }

  showSelf() {
    stroke(0);
    fill(0, 80, 80);
    rect(this.x, this.y, this.size, this.size);
    noStroke();
  }
}

// for the time power up
class PowerUpTime {
  constructor() {
    this.x = random(width);
    this.y = random(height);
  }
  move() {
    if (level1) {
      if (time % 40 == 0 && time > 0) {
        this.x = random(width);
        this.y = random(height);
      }
    } else if (level2) {
      if (time % 20 == 0 && time > 0) {
        this.x = random(width);
        this.y = random(height);
      }
    }
  }

  display() {
    fill(random(360), 80, 100);
    if (level1) {
      rect(this.x, this.y, 15, 15);
    } else if (level2) {
      rect(this.x, this.y, 7, 7);
    }
  }
}

// for the lives power  up
class PowerUpResetLives {
  constructor() {
    this.x1 = random(width);
    this.y1 = random(height);
    this.x2 = this.x1 + 8;
    this.y2 = this.y1 + 16;
    this.x3 = this.x1 - 8;
    this.y3 = this.y1 + 16;
  }
  move() {
    if (level1) {
      if (time % 40 == 0 && time > 0) {
        this.x1 = random(width);
        this.y1 = random(height);
        this.x2 = this.x1 + 8;
        this.y2 = this.y1 + 16;
        this.x3 = this.x1 - 8;
        this.y3 = this.y1 + 16;
      }
    } else if (level2) {
      if (time % 20 == 0 && time > 0) {
        this.x1 = random(width);
        this.y1 = random(height);
        this.x2 = this.x1 + 5;
        this.y2 = this.y1 + 10;
        this.x3 = this.x1 - 5;
        this.y3 = this.y1 + 10;
      }
    }
  }
  display() {
    fill(random(360), 80, 100);
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
  }
}

// for the score reducer obastacle
class Obstacle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.rectWidth = random(10, 25);
    this.rectHeight = random(5, 20);
  }
  move() {
    if (level1) {
      if (time % 10 == 0 && time > 0) {
        this.x = random(width);
        this.y = random(height);
        this.rectWidth = random(10, 16);
        this.rectHeight = random(5, 10);
      }
    } else if (level2) {
      if (time % 7 == 0 && time > 0) {
        this.x = random(width);
        this.y = random(height);
        this.rectWidth = random(25, 40);
        this.rectHeight = random(20, 30);
      }
    }
  }
  display() {
    fill(270, 100, 40);
    rect(this.x, this.y, this.rectWidth, this.rectHeight);
  }
}
