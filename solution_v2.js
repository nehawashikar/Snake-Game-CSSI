// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, color, collideRectRect, colorMode, createCanvas, fill, frameRate, keyCode, height,
 *    loop, noFill, noLoop, noStroke, random, rect, round, stroke, sqrt, text, width
 *    UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW
 */

// Solution: Version 2 - With Tail

let backgroundColor, playerSnake, currentApple, score, lives;
let label = 'listening...';
let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/aaRjZ9wBL/';

classifier = ml5.soundClassifier(imageModelURL + 'model.json');

function setup() {

  createCanvas(500, 500);
  colorMode(HSB, 360, 100, 100);
  backgroundColor = 95;
  frameRateChanger = 6;
  frameRate(frameRateChanger);
  
  classifier.classify(gotResult);
  
  playerSnake = new Snake();
  currentApple = new Apple();
  
  power = [];
  for (let i = 0; i < 3; i++){
    let p = new PowerUpScore();
    power.push(p);
  }
  
  power2 = [];
  for (let i = 0; i < 3; i++){
    let p2 = new PowerUpResetLives();
    power2.push(p2);
  }
  
  gameIsOver = false;
  score = 0;
  lives = 3;
  time = 0;
  timeMultiple = false;
  
}

function draw() {
  background(backgroundColor);
  
  playerSnake.moveSelf();
  playerSnake.showSelf();
  playerSnake.checkCollisions();
  playerSnake.checkApples();

  currentApple.showSelf();

  displayText();
  displayNoise();
  handleTime();
  
  for (let powers of power){
    powers.move();
    powers.display();
    
    let scoreInc = collideRectRect(powers.x, powers.y, 15, 15, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
    if(scoreInc){
      score += 2;
      powers.x = random(width);
      powers.y = random(height);
    }
  }
  
  for (let powers2 of power2){
    powers2.move();
    powers2.display();
    
    let livesReset1 = collidePointTriangle(playerSnake.x, playerSnake.y, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset2 = collidePointTriangle(playerSnake.x + playerSnake.size, playerSnake.y, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset3 = collidePointTriangle(playerSnake.x, playerSnake.y + playerSnake.size, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset4 = collidePointTriangle(playerSnake.x + playerSnake.size, playerSnake.y + playerSnake.size, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    if(livesReset1 || livesReset2 || livesReset3 || livesReset4){
      lives = 3;
      powers2.x1 = random(width);
      powers2.y1 = random(height);
      powers2.x2 = powers2.x1 + 8;
      powers2.y2 = powers2.y1 + 16;
      powers2.x3 = powers2.x1 - 8;
      powers2.y3 = powers2.y1 + 16;
    }
  }
  
  if(lives <= 0 || gameIsOver){
    gameOver();
  }

}

function displayText() {
  fill(0);
  text(`Your score is: ${score}`, 5, 15)
  text(`You have ${lives} lives left`, 5, 30)
}

function displayNoise(){
  fill(0);
  text('*' + label + '*', 5, height - 4);
}

function gotResult(error, results){
  if(error){
    console.error('error');
    return;
  }
  label = results[0].label; 
  controlSnake();
}

function controlSnake(){
  if (label === 'Up' && playerSnake.direction != "S") {
    playerSnake.direction = "N";
  } else if (label === 'Down' && playerSnake.direction != "N") {
    playerSnake.direction = "S";
  } else if (label === 'Right' && playerSnake.direction != "W") {
    playerSnake.direction = "E";
  } else if (label === 'Left' && playerSnake.direction != "E") {
    playerSnake.direction = "W";
  }  
}

function handleTime(){
  fill(color(20,100,100));
  text(`Time taken in this level: ${time}`, 150, 20);
  time++;
}

function keyPressed() {
    if (keyCode === 32) {
      restartGame();
    }
}

function restartGame() {
  score = 0;
  lives = 3;
  time = 0;
  frameRateChanger = 6;
  playerSnake = new Snake();
  currentApple = new Apple();
  loop();
}

function gameOver() {
  stroke(0);
  fill(0);
  text("GAME OVER", 50, 50);
  noLoop();
}

class Snake {
  constructor() {
    this.size = 10;
    this.x = width/2;
    this.y = height - this.size;
    this.direction = 'N';
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
    if (collideRectRect(this.x, this.y, this.size, this.size,
        currentApple.x, currentApple.y, currentApple.size, currentApple.size)) {
      score += 1;
      currentApple = new Apple();
      this.extendTail();
      frameRateChanger += 1;
    }
  }

  checkCollisions() {
    
    //collisions with the canvas borders
    if (this.y >= height) {
      lives--;
      this.y = height - this.size; 
      this.direction = "N";
      currentApple = new Apple();
    }
    if (this.y <= 0) {
      lives--;
      this.y = this.size; 
      this.direction = "S";
      currentApple = new Apple();
    }
    if (this.x >= width) {
      lives--;
      this.x = width - this.size; 
      this.direction = "W";
      currentApple = new Apple();
    }
    if (this.x <= 0) {
      lives--;
      this.x = this.size; 
      this.direction = "E";
      currentApple = new Apple();
    }
    
    //collision of snake with itself
    if (this.tail.length > 2) {
      for (let i=1; i < this.tail.length; i++) {
        if (this.x == this.tail[i].x && this.y == this.tail[i].y) {
          gameIsOver = true;
        }
        text(i, this.tail[i].x, this.tail[i].y)
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
    this.size = 10;
  }

  showSelf() {
    fill(0, 80, 80);
    rect(this.x, this.y, this.size, this.size);
  }
}

class PowerUpScore{
  constructor(){
    this.x = random(width);
    this.y = random(height);
  }
  move(){
    if(time % 30 == 0 && time > 0){
      this.x = random(width);
      this.y = random(height);
    }
  }
  display(){
    fill(random(360), 80, 100);
    textSize(9);
    text('  Score \nIncrease', this.x - 10, this.y - 14);
    rect(this.x, this.y, 15, 15);
    textSize(12);
  }
}

class PowerUpResetLives{
  constructor(){
    this.x1 = random(width);
    this.y1 = random(height);
    this.x2 = this.x1 + 8;
    this.y2 = this.y1 + 16;
    this.x3 = this.x1 - 8;
    this.y3 = this.y1 + 16;
  }
  move(){
    if(time % 40 == 0 && time > 0){
      this.x1 = random(width);
      this.y1 = random(height);
      this.x2 = this.x1 + 8;
      this.y2 = this.y1 + 16;
      this.x3 = this.x1 - 8;
      this.y3 = this.y1 + 16;
    }
  }
  display(){
    fill(random(360), 80, 100);
    textSize(9);
    text('Reset \n Lives', this.x1 - 12.5, this.y1 + 25);
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
    textSize(12);
  }
}

class Obstacle{
  
}
