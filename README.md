# RCworkshopMultiPlayerGame

Learn to make a multiplayer game with Node, Express.js and socket.io!

We'll be using a simple tic tac toe game as an example:
In order to follow this tutorial, you'll have to have node installed.

1: fork this repo!

then type ```npm install``` in your terminal. This installs the dependencies in the ```package.json``` file.

2: create an ```index.js``` file with the following:
```javascript
var express = require("express");
var app = express();
var http = require("http").Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/tictactoe.html');
});

http.listen(port, function(){
  console.log('listening on :3000');
});
```
This code initializes the socket on the server side.
with this code, you should be able to go to your terminal and 

```
$ node index.js
```

navigate to localhost:3000 in your web browser and see the single-player version of your game!

3: To make this a multiplayer game, we have to create a 'game room' with an id that you can pass to your opponent so they can join you online to play.

This means we should modify the ```tictactoe.html``` file so that we have a 'create/join game' screen to either create or join a new game.

Open up ```tictactoe.html```, you should see this:

```html
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Tic Tac Toe</title>
  <link rel="stylesheet" href="./styles/tttstyle.css"></link>
  <script src="./js/tictactoe.js"></script>
</head>

<body>
 <div id='gamecontrols'>
  <button id="refresh">New Game</button>
 </div>
 <div>
   <h2 id='gamestatus'>WINNER!</h2>
 </div>
  <div id="gameboard">
  </div>
</body>
```

To make the different game screens, we can use html templates. These allow us to switch between multiple screens without having to write multiple html files. This will get called by your app later on.

Put this at the bottom of your ```tictactoe.html```:

```html
<div id="game_area"></div>


<script id="initial_screen" type="text/template">

<div>
    <h1>Create a new Tic Tac Toe Game</h1>
    <button id="start_button">Start Game</button>
    <br />
    <button id="join_game_button">Join Game</button>
    <input id="join_game_in" type="text"/>
</div>

</script>



<script id="game_screen" type="text/template">

<div>
    <h1 id="game_id"></h1>
    <p id='opponent'>Waiting for other player...</p>
 <div id='gamecontrols'>
 <button id="refresh">New Game</button>
 </div>
 <div>
   <h2 id='gamestatus'>WINNER!</h2>
 </div>
  <div id="gameboard">
  </div>
</div>

</script>
```




4: Now let's create an ```app.js``` file in the public/js directory.

```javascript

function init(){
  var socket = io();
  var gameArea = document.getElementById('game_area');
  var initialScreen = document.getElementById('initial_screen').innerHTML;
  gameArea.innerHTML = initialScreen;

  var startButton = document.getElementById('start_button');
  startButton.addEventListener('click', function(){
    socket.emit('create room');
  })
}
```

Creating the variable ```socket = io()``` initializes the socket on the client side. Recall how ```index.js``` initialized the server, it's helpful to remember which is the client (what you see in your browser) and which is the server (what helps your browser communicate with your opponent's browser).

Then we grab the ```'game_area'``` element in ```tictactoe.html``` so we can write the template for the ```'initial_screen'``` inside of it.

After that we add an event listener to the ```'start_button'``` element so that when we click on it we (the client) send a ```'create room'``` event to the server.

5: Now that the client is sending something to the server, we need to make sure the server knows how to read it.

Go to ```'index.js'```

```javascript
io.on('connection', function(socket){
  var gameId = null;
  socket.on('create room', function(){
    gameId = Math.random() * 1000000 | 0;
    socket.join(gameId);
    socket.emit('gameId', gameId);
  })
}
```

With this code, the server generates a random number with up to 7 digits to act as a game room id, it then creates a new game room and adds the first client to it. With it's own ```socket.emit()``` it sends the id number back to the client so she can share it with her opponent, who will join her later.

Now the client has received a ```'gameId'``` event, we have to handle it.

In ```app.js``` we add:

```javascript
socket.on('gameId', function(data){
    var gameScreen = document.getElementById('game_screen').innerHTML;
    gameArea.innerHTML = gameScreen;
    var gameIdHeader = document.getElementById('game_id');
    gameIdHeader.textContent = data;
  });
```

This updates the game area div with the ```'game_screen'``` template, and displays the game id.

6: Now we need to allow the opponent to join the game.

In ```app.js``` we add an event listener on the 'Join Game' button:

```javascript
  var joinButton = document.getElementById('join_game_button');
  
  joinButton.addEventListener('click', function(){
    var joinGameId = document.getElementById('join_game_in').value;
    socket.emit('join room', joinGameId)
  })
```

This sends a ```'join room'``` event to the server along with the game ID that the opponent enters in the input field.

So now in ```index.js```, add the following within the ```io.on('connection', function(socket){ ... })``` block. If you put it outside this function, it won't know what the ```socket``` variable refers to.


```javascript
socket.on('join room', function(joinGameId){
    gameId = joinGameId;
    var roomId = socket.adapter.rooms[joinGameId];
    if (roomId != undefined){
      socket.join(gameId);
      io.sockets.in(gameId).emit('message', 'Let the game begin!');
    }
  });
```

The server checks if a 'game room' with the given id exists, and if so, it adds the opponent to the 'game room'. Then, the ```io.sockets.in().emit()``` sends a 'message' event to all the clients in the game room, notifying them that the game has begun.

7: Now we need to get this game started.

Update your ```app.js``` file with the following:

```javascript
  socket.on('message', function(message){
    var gameScreen = document.getElementById('game_screen').innerHTML;
    gameArea.innerHTML = gameScreen;
    var opponent = document.getElementById('opponent');
    opponent.textContent = message;
    
    startNewGame();
    
    var newGame = document.getElementById('refresh');
    newGame.addEventListener('click', function(){
      socket.emit('new game');
    });
  });
  
  function startNewGame(){
    createGame();
    
    var boxes = document.getElementsByClassName('col');
    for (var i = 0; i < boxes.length; i++){
      boxes[i].addEventListener('click', function(event){
        socket.emit('move', event.target.id)
      });
    }; 
  }
  ```
  
  This updates the game area for every client in the 'game room' with a gameboard and the message to begin the game. 
  



Resources we used for this project are:
This tutorial by Eric Terpstra:

http://modernweb.com/2013/09/30/building-multiplayer-games-with-node-js-and-socket-io/


And the wonderful stack overflow answer by learnRPG:

http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io

