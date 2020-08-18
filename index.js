var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');

app.use(express.static(path.join(__dirname,"public")));

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!: http://localhost:3000/");
});

var objects = {};

io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
  objects[socket.id] = new UserObject();
  childArray[socket.id] = [];
  io.to(socket.id).emit('connected', GAME_SETTINGS);

  socket.on('disconnect', function(){
    delete objects[socket.id];
    delete childArray[socket.id];
    console.log('user disconnected: ', socket.id);
  });
  socket.on('keydown', function(keyCode){
    objects[socket.id].keypress[keyCode]=true;
  });
  socket.on('keyup', function(keyCode){
    delete objects[socket.id].keypress[keyCode];
  });
});

var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, CHAR_A = 65;
var GAME_SETTINGS = {
  WIDTH : 1200, HEIGHT : 800, BACKGROUND_COLOR : "#FFFFFF"
};

var feedArray=[];
var feedTime = 100;
var tempTime = 0;
var childArray={};


var update = setInterval(function(){
  var idArray=[];
  var statusArray={};

  for(var id in io.sockets.clients().connected){
    if(objects[id].keypress[LEFT])  objects[id].status.x -= 6;
    if(objects[id].keypress[UP])    objects[id].status.y -= 6;
    if(objects[id].keypress[RIGHT]) objects[id].status.x += 6;
    if(objects[id].keypress[DOWN])  objects[id].status.y += 6;
    if(objects[id].keypress[CHAR_A]){
      objects[id].status.width += 2;
      objects[id].status.height += 2;
    }

    feedArray.forEach((item, i) => {
      if(objects[id].status.x + objects[id].status.width >= item.status.x && objects[id].status.x <= item.status.x + item.status.width
      && objects[id].status.y + objects[id].status.height >= item.status.y && objects[id].status.y <= item.status.y + item.status.height){
        objects[id].status.width += 2;
        objects[id].status.height += 2;
        item.parent = objects[id];

        if(childArray[id].length > 0){

          var lastnum = childArray[id].length - 1;
          item.parent = childArray[id][lastnum];
        }

        var tempf = new FeedObject();
        tempf.parent = item.parent;
        tempf.color = item.color;


        childArray[id].push(tempf);

        feedArray.splice(i, 1);
      }
    });



      childArray[id].forEach((c, i) => {

        if(c.parent.status.point.length > 3){
          c.status.x = c.parent.status.point[3][0];
          c.status.y = c.parent.status.point[3][1];
        }

        var dubcheck = false;

        c.status.point.forEach(function(item){
          if(item[0] === c.status.x && item[1] === c.status.y){
            dubcheck = true;
          }
        });

        if(dubcheck == false){
            c.status.point.push([c.status.x, c.status.y]);
        }

        if(c.status.point.length > 5){
          c.status.point.splice(0, 1);
        }

      });



    var dubcheck = false;

    objects[id].status.point.forEach(function(item){
      if(item[0] === objects[id].status.x + objects[id].status.width / 2 - 10 && item[1] === objects[id].status.y + objects[id].status.height / 2 - 10){
        dubcheck = true;
      }
    });

    if(dubcheck == false){
        objects[id].status.point.push([objects[id].status.x + objects[id].status.width / 2 - 10, objects[id].status.y + objects[id].status.height / 2 - 10]);
    }

    if(objects[id].status.point.length > 5){
      objects[id].status.point.splice(0, 1);
    }

    idArray.push(id);
    statusArray[id]=objects[id].status;

    if(tempTime >= feedTime){
      feedArray.push(new FeedObject());
      tempTime = 0;
    }
    tempTime += 1;


  }

  io.emit('update',idArray, statusArray, feedArray, childArray);
  io.emit('update2',idArray, childArray);
},10);

function UserObject() {
  var color="#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.point = [];
  this.status.x = 0;
  this.status.y = 0;
  this.status.height = 20;
  this.status.width = 20;
  this.status.color = color;
  this.keypress = [];
}

function FeedObject() {
  var color="#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.x = Math.floor(Math.random() * GAME_SETTINGS.WIDTH);
  this.status.y = Math.floor(Math.random() * GAME_SETTINGS.HEIGHT);
  this.status.height = 20;
  this.status.width = 20;
  this.status.color = color;
  this.parent;
  this.status.point = [];
  this.keypress = [];
}

function FollowParent(parent, child){

}
