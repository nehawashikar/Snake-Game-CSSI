
const express = require("express");
const socket = require("socket.io"); // import statement

let snakes = [];

class Snake{
  constructor(id, x, y, direction, size, speed, tail){
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.size = size;
    this.speed = speed;
  }
}

let app = express();
let server = app.listen(3000);

app.use(express.static('public')); //"static" to host static files

console.log("my scocket server is running");

let io = socket(server); // const

setInterval(heartbeat, 33);

function heartbeat(){
  io.sockets.emit('heartbeat', snakes);  // ... goes to everyone INCLUDING this client
}

io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log('new connection: ' + socket.id);

  socket.on('start',
    function(data){
      console.log(`${socket.id} ${data.x} ${data.y} ${data.direction} ${data.size} ${data.speed}`);
      let snake = new Snake(socket.id, data.x, data.y, data.direction, data.size,data.speed)
      snakes.push(snake);
      //socket.broadcast.emit('mouse', data); // goes to everyone exclusing this client

      //console.log(data);
    }
  );
  socket.on('update', function(data){
    //console.log(`${socket.id} ${data.x} ${data.y} ${data.direction} ${data.size} ${data.speed}`);

    let snake;
    for (let i=0; i <snakes.length; i++){
      if (socket.id == snakes[i].id){
        snake = snakes[i];
      }
    }

    snake.x = data.x;
    snake.y = data.y;
    snake.direction = data.direction;
    snake.size = data.size;
    snake.speed = data.speed;
    }
  );
};
