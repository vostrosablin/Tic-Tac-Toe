var express = require('express');
var io = require('socket.io');

var app = module.exports = express.createServer();

var io = io.listen(app);
// Configuration


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.listen(3000);
console.log("Tic-Tac-Toe server started on port %d ", app.address().port);

var xo = 'x';
var o = false;
var m_players = [];
var i = 0; // Number of connetcted players

var matrix = {
  '11': '', '12':'', '13':'',
  '21': '', '22':'', '23':'',
  '31': '', '32':'', '33': ''
}

io.sockets.on('connection', function(socket)
{

  socket.on('client_connected', function(player)
  {
    player.id = socket.id;
    player.label = xo;

    if(xo == 'x' && o == false)
    {
      xo = 'o';
      o = true;
    }
    else
    {
      xo = 'wather';
    }
    m_players[i] = player;
    i++;

    socket.emit('connect_1', player);
    io.sockets.emit('load',m_players);
  });

  socket.on('process_move', function(coords)
  {
    var n = 0;
    coords = coords.replace("#",'');


    while (n < m_players.length)
    {
      if (m_players[n].id == socket.id)
      {
        matrix[coords] = m_players[n].label;
      }
      n++;
    }


    console.log(matrix);
    // Proceed move
    io.sockets.emit('label', coords);

    // Win check
    if( (matrix['11'] == matrix['12'] && matrix['12'] == matrix['13'] && matrix['11'] != '') ||
    (matrix['21'] == matrix['22'] && matrix['22'] == matrix['23'] && matrix['21'] != '') ||
    (matrix['31'] == matrix['32'] && matrix['32'] == matrix['33'] && matrix['31'] != '') ||

    (matrix['11'] == matrix['21'] && matrix['21'] == matrix['31'] && matrix['11'] != '') ||
    (matrix['12'] == matrix['22'] && matrix['22'] == matrix['32'] && matrix['12'] != '') ||
    (matrix['13'] == matrix['23'] && matrix['23'] == matrix['33'] && matrix['13'] != '') ||

    (matrix['11'] == matrix['22'] && matrix['22'] == matrix['33'] && matrix['11'] != '') ||
    (matrix['31'] == matrix['22'] && matrix['22'] == matrix['13'] && matrix['31'] != '')
    )
    {
      io.sockets.emit('gameover', xo);
    }
  });

  socket.on('disconnect', function()
   {
     var j = 0;
     var n = 0;
     var tmp = [];

     while (n < m_players.length)
     {
       if (m_players[j].id == socket.id)
       {
         if(m_players[j].label == 'o')
         {
           xo = 'o';
           o = false;
         }
         if(m_players[j].label == 'x')
         {
           xo = 'x';
         }
     	   n++;
     	 }

     	 if (n < m_players.length)
     	 {
     	   tmp[j] = m_players[n];
     	   j++;
     	   n++;
     	  }
     	}

     	m_players = tmp;
     	i = j;
      io.sockets.emit('load', m_players);
   });

});
