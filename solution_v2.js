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
    let p = new PowerUps();
    power.push(p);
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
  //displayPowerUps();
  
  for (let powers of power){
    powers.move();
    powers.display();
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
  text(`Time taken to complete level: ${time}`, 150, 20);
  time++;
}

function displayPowerUps(){
  if (time%27 == 0){
    powerUp = new PowerUps;
    timeMultiple = true;
  }
  else if (time%13 == 0) {
    powerUp.x1 = 0
    powerUp.y1 = 0
    powerUp.x2 = powerUp.x1 + 20;
    powerUp.y2 = powerUp.y1 - 40;
    powerUp.x3 = powerUp.x2 + 20;
    powerUp.y3 = powerUp.y1;
    timeMultiple = false;
  }
}

function restartGame() {
  score = 0;
  time = 0;
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
    
    //collisions with power-ups
    
    
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
    fill(random(360),50,70);
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

class PowerUps{
  constructor(){
    this.x = random(width);
    this.y = random(60,470);
  }
  move(){
    if(time % 500 == 0 && time > 0){
      this.x = random(width);
      this.y = random(60,470);
    }
  }
  display(){
    fill(random(360), 100, 100);
    rect(this.x, this.y, 10, 10);
  }
}
/*
class PowerUps{
  constructor() {
    this.x1 = random(100, width-200);
    this.y1 = random(100, height-200);
    this.x2 = this.x1 + 20;
    this.y2 = this.y1 - 40;
    this.x3 = this.x2 + 20;
    this.y3 = this.y1;
  }
  
  showSelf(){
    if (timeMultiple) {
      fill(random(360), 50, 100);
      triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
    }
  }
}*/
