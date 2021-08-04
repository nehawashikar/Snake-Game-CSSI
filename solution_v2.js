// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, color, collideRectRect, colorMode, createCanvas, fill, frameRate, keyCode, height,
 *    loop, noFill, noLoop, noStroke, random, rect, round, stroke, sqrt, text, width
 *    UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW
 */

// Solution: Version 2 - With Tail

let backgroundColor, playerSnake, currentApple, score, lives, level1, level2, level3;
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
  
  button1 = createButton('Level 1 - EASY');
  button1.position(230, 260);
  button1.mousePressed(levelOne);
  
  button2 = createButton('Level 2 - MEDIUM');
  button2.position(220, 290);
  button2.mousePressed(levelTwo);
  
  button3 = createButton('Level 3 - HARD');
  button3.position(230, 320);
  button3.mousePressed(levelThree);
  
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
  
  
  obs = [];
  //if (level1){
    for (let i = 0; i < 3; i++){
      let o = new Obstacle();
      obs.push(o);
    }
  /*} else if (level2){
    for (let i = 0; i < 6; i++){
      let o = new Obstacle();
      obs.push(o);
    }
  }*/
  
  gameIsOver = false;
  score = 0;
  lives = 5;
  time = 0;
  
  home = true;
  level1 = false;
  level2 = false;
  level3 = false;
  
}

function draw() {
  background(backgroundColor); //random(50,100)
  
  homeScreen();
  
  if(!home){
    if (level1 || level2) {
    playerSnake.moveSelf();
    playerSnake.showSelf();
    playerSnake.speedBoost();
    playerSnake.checkCollisions();
    playerSnake.checkApples();
    currentApple.showSelf();
    powerAndObs();
    displayText();
    displayNoise();
    handleTime();
    } else if (level3) {
      //code
    }
  }
  
  if(lives <= 0 || gameIsOver){
    gameOver();
    gameIsOver = false;
  }
}

function levelOne(){
  level1 = true;
  home = false;
  button1.position(0-200, 0);
  button2.position(0-200, 0);
  button3.position(0-200, 0);
}

function levelTwo(){
  level2 = true;
  home = false;
  button1.position(0-200, 0);
  button2.position(0-200, 0);
  button3.position(0-200, 0);
}

function levelThree(){
  level3 = true;
  home = false;
  button1.position(0-200, 0);
  button2.position(0-200, 0);
  button3.position(0-200, 0);
}

function homeScreen(){
  if(home){
    fill(120,100,20);
    rect(0,0,width,height);
    textSize(60);
    fill(random(360),100,100);
    stroke(0);
    strokeWeight(12);
    text('SNAKE GAME',50,70);
    noStroke();
    strokeWeight(2);
    textSize(12);
    
    fill(0);
    rect(70,100,40);
    rect(115,100,40);
    rect(160,100,40);
    rect(205,100,40);
    rect(250,100,40);
    rect(295,100,40);
    rect(340,100,40);
    rect(385,100,40);

    fill(0,100,100);
    textSize(20);
    text('CHOOSE A LEVEL',160,200);
    textSize(12);
    fill(100);
    text('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',10,height-160);
    text('                                   Press the SPACE bar to restart current level',10,height-140);
    text('             Press the BACKSPACE bar to restart whole game and return to this page',10,height-120);
    text('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',10,height-100);
    text('                    Bright colorful squares are powerups used to increase score by 2',10,height-80);
    text('                    Bright colorful triangles are powerups used to reset lives back to 5',10,height-60);
    text('Dim colorful rectangles that are differently shaped are obstacles that reset score back to 0',10,height-40);
    text('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',10,height-20);
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

function powerAndObs(){
  for (let powers of power){
    powers.move();
    powers.display();
    
    if (level1){
    let scoreInc = collideRectRect(powers.x, powers.y, 15, 15, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
    if(scoreInc){
      score += 2;
      powers.x = random(width);
      powers.y = random(height);
    }
    } else if (level2){
      let scoreInc = collideRectRect(powers.x, powers.y, 7, 7, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
      if(scoreInc){
      score += 2;
      powers.x = random(width);
      powers.y = random(height);
    }
    }
  }
  
  for (let powers2 of power2){
    powers2.move();
    powers2.display();
    
    let livesReset1 = collidePointTriangle(playerSnake.x, playerSnake.y, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset2 = collidePointTriangle(playerSnake.x + playerSnake.size, playerSnake.y, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset3 = collidePointTriangle(playerSnake.x, playerSnake.y + playerSnake.size, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    let livesReset4 = collidePointTriangle(playerSnake.x + playerSnake.size, playerSnake.y + playerSnake.size, powers2.x1, powers2.y1, powers2.x2, powers2.y2, powers2.x3, powers2.y3);
    
    
    if (level1) {
      if(livesReset1 || livesReset2 || livesReset3 || livesReset4){
        lives = 5;
        powers2.x1 = random(width);
        powers2.y1 = random(height);
        powers2.x2 = powers2.x1 + 8;
        powers2.y2 = powers2.y1 + 16;
        powers2.x3 = powers2.x1 - 8;
        powers2.y3 = powers2.y1 + 16;
      }
    } else if (level2) {
      if(livesReset1 || livesReset2 || livesReset3 || livesReset4){
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
  
  for (let theObs of obs){
    theObs.move();
    theObs.display();
    
    let scoreInc = collideRectRect(theObs.x, theObs.y, theObs.rectWidth, theObs.rectHeight, playerSnake.x, playerSnake.y, playerSnake.size, playerSnake.size);
    if (level1) {
      if(scoreInc){
      score = 0;
      theObs.x = random(width);
      theObs.y = random(height);
      theObs.rectWidth = random(10,16);
      theObs.rectHeight = random(5,10);
    }
    } else if (level2) {
      if(scoreInc){
      score = 0;
      theObs.x = random(width);
      theObs.y = random(height);
      theObs.rectWidth = random(25,40);
      theObs.rectHeight = random(20,30);
    }
    }
  }
}

function keyPressed() {
  
  if (keyCode === UP_ARROW && playerSnake.direction != 'S') {
    playerSnake.direction = "N";
  }else if (keyCode === DOWN_ARROW && playerSnake.direction != 'N') {
    playerSnake.direction = "S";
  }else if (keyCode === RIGHT_ARROW && playerSnake.direction != 'W') {
    playerSnake.direction = "E";
  }else if (keyCode === LEFT_ARROW && playerSnake.direction != 'E') {
    playerSnake.direction = "W";
  }else if (keyCode === 32) {
    restartGame();
  }else if (keyCode === BACKSPACE) {
    home = true;
    button1.position(230, 260);
    button2.position(220, 290);
    button3.position(230, 320);
  }
}

function restartGame() {
  score = 0;
  lives = 5;
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
    this.boost = 0;
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

  speedBoost(){
    if (level2){
      this.boost = 10;
      if (keyCode === 13){
        this.boost -= 1;
        if (this.boost > 0) {
          this.speed = 50;
        } else if (this.boost <= 0){
          this.speed = 20;
        }
      }
    }
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
      //frameRateChanger += 1;
    }
  }

  checkCollisions() {
    
    //collisions with the canvas borders
    if (this.y >= height) {
      lives--;
      this.y = this.size; 
      this.direction = "S";
      currentApple = new Apple();
    }
    if (this.y <= 0) {
      lives--;
      this.y = height - this.size; 
      this.direction = "N";
      currentApple = new Apple();
    }
    if (this.x >= width) {
      lives--;
      this.x = this.size; 
      this.direction = "E";
      currentApple = new Apple();
    }
    if (this.x <= 0) {
      lives--;
      this.x = width - this.size; 
      this.direction = "W";
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
    this.size = 15;
  }

  showSelf() {
    stroke(0);
    fill(0, 80, 80);
    rect(this.x, this.y, this.size, this.size);
    noStroke();
  }
}

class PowerUpScore{
  constructor(){
    this.x = random(width);
    this.y = random(height);
  }
  move(){
    if (level1) {
      if(time % 40 == 0 && time > 0){
      this.x = random(width);
      this.y = random(height);
      }
    }
     else if (level2) {
      if(time % 20 == 0 && time > 0){
      this.x = random(width);
      this.y = random(height);
      }
     }
  }
  
  display(){
    fill(random(360), 80, 100);
    if (level1) {
      rect(this.x, this.y, 15, 15);
    } else if (level2) {
        rect(this.x, this.y, 7, 7);
    }
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
    if (level1) {
      if(time % 40 == 0 && time > 0){
      this.x1 = random(width);
      this.y1 = random(height);
      this.x2 = this.x1 + 8;
      this.y2 = this.y1 + 16;
      this.x3 = this.x1 - 8;
      this.y3 = this.y1 + 16;
    }
    } else if (level2) {
      if(time % 20 == 0 && time > 0){
      this.x1 = random(width);
      this.y1 = random(height);
      this.x2 = this.x1 + 5;
      this.y2 = this.y1 + 10;
      this.x3 = this.x1 - 5;
      this.y3 = this.y1 + 10;
    }
    }
  }
  display(){
    fill(random(360), 80, 100);
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
  }
}

class Obstacle{
  constructor(){
    this.x = random(width);
    this.y = random(height);
    this.rectWidth = random(10,25);
    this.rectHeight = random(5,20);
  }
  move(){
    if (level1) {
      if (time % 10 == 0 && time > 0){
        this.x = random(width);
        this.y = random(height);
        this.rectWidth = random(10,16);
        this.rectHeight = random(5,10);
      } 
    } else if (level2) {
      if (time % 7 == 0 && time > 0){
        this.x = random(width);
        this.y = random(height);
        this.rectWidth = random(25,40);
        this.rectHeight = random(20,30);
      }
    }
  }
  display(){
    fill(random(360), 100, 40);
    rect(this.x, this.y, this.rectWidth, this.rectHeight);
  }
}
