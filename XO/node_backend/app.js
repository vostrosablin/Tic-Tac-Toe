var express = require('express');
var io = require('socket.io');

var app = module.exports = express.createServer();
var io = io.listen(app);

//Configuring express
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});




//In case the frontend is writen with some template (jade)
app.get('/', function(req, res){
  res.render('index');
});

app.listen(3000);
console.log("Server started at" +  app.address().port + "port");

//game starts
var xo = 'x'; //first player plays as x by default
var o = false;
var players = []; //players array
var i = 0; //ammount of connected players.

//introducing some matrix with coordiantes
var matrix = { '11': '', '12':'', '13':'', '21': '', '22':'', '23':'', '31': '', '32':'', '33': ''};

io.sockets.on('connection', function(socket)
{
  console.log(matrix);

  socket.on('client_connected', function(player)
  {
    player.id = socket.id;
    player.labeling = xo;

    if(xo == 'x' && o == false)
    {
      xo = 'o';
      o = true;
    }
    else
    {
      xo = 'spectator';
    }
    players[i] = player;
    i++;

    socket.emit('connect_1', player);

    io.sockets.emit('load', players);
  });


  //handling move
  socket.on('move', function(coords)
  {
    var n = 0;


    while (n < players.length)
    {
      if (players[n].id == socket.id)
      {
        matrix[coords] = players[n].labeling;
      }
      n++;
    }

    console.log(matrix);
    // update clients with the move
    io.sockets.emit('labeling', coords);

    // wining situation
    if( (matrix['11'] == matrix['12'] && matrix['12'] == matrix['13'] && matrix['11'] != '') ||
    (matrix['21'] == matrix['22'] && matrix['22'] == matrix['23'] && matrix['21'] != '') ||
    (matrix['31'] == matrix['32'] && matrix['32'] == matrix['33'] && matrix['2-0'] != '') ||

    (matrix['11'] == matrix['21'] && matrix['21'] == matrix['21'] && matrix['11'] != '') ||
    (matrix['12'] == matrix['22'] && matrix['22'] == matrix['32'] && matrix['12'] != '') ||
    (matrix['13'] == matrix['23'] && matrix['23'] == matrix['33'] && matrix['13'] != '') ||

    (matrix['11'] == matrix['22'] && matrix['22'] == matrix['33'] && matrix['11'] != '') ||
    (matrix['31'] == matrix['22'] && matrix['22'] == matrix['13'] && matrix['31'] != '')
    )
    {
      io.sockets.emit('gameover', xo);
    }
  });

  socket.on('disconnect', function(){
    //disconnect handler
  });

});
