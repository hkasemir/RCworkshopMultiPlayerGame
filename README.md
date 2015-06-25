# RCworkshopMultiPlayerGame

Learn to make a multiplayer game with Node, Express.js and socket.io!

We'll be using a simple tic tac toe game as an example.
This is what the game will look like (if black just won):

<img src="https://github.com/hkasemir/RCworkshopMultiPlayerGame/blob/master/images/tictactoe_winner.png">

In order to follow this tutorial, you'll have to have node installed.

## 1: Clone this Repo!

The basic javascript file for the game logic, html, and css for styling are included in this repository. In fact, that's all that you need to get started, so if you feel like using your own game, feel free to modify the below tutorial to fit your project!

Once you've cloned the repo to your computer, navigate in your terminal to the directory you saved it in and type ```npm install```. This installs the dependencies in the ```package.json``` file, which contains socket.io and express.js.

## 2: Make a Node Server

Create an ```index.js``` file with the following:
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
With this file saved in the base directory, you should be able to go to your terminal and 

```
$ node index.js
```

navigate to localhost:3000 in your web browser and see the single-player version of your game!

## 3: Get a Room

To make this a multiplayer game, we have to create a 'game room' with an id that you can pass to your opponent so they can join you online to play.

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

replace everything in the ```<body>``` tags of your original ```tictactoe.html```, with the following:

```html
<body>
  <div id="game_area"></div>
</body>

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


## 4: Create your Client

Now let's create an ```app.js``` file in the public/js directory, and add it to your ```tictactoe.html``` file right below the ```tictactoe.js``` file. While you're at it, we should also add the script for socket.io, like so:
```html
...
  <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
  <script src="./js/tictactoe.js"></script>
  <script src="./js/app.js" type="text/javascript"></script>
...
```
and then in ```app.js```:
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

window.addEventListener('load', init);
```

Creating the variable ```socket = io()``` initializes the socket on the client side. Recall how ```index.js``` initialized the server, it's helpful to remember which is the client (what you see in your browser) and which is the server (what helps your browser communicate with your opponent's browser).

Then we grab the ```'game_area'``` element in ```tictactoe.html``` so we can write the template for the ```'initial_screen'``` inside of it.

After that we add an event listener to the ```'start_button'``` element so that when we click on it we (the client) send a ```'create room'``` event to the server.

Finally, outside the ```init()``` function, we add an event listener to the window so that when the page loads, we call it. In the original ```tictactoe.js``` file, we do this same thing, so go to the bottom and comment out this line to remove the redundancy:
```javascript
// window.addEventListener('load', createGame);
```

## 5: Client-Server Communication

Now that the client is sending something to the server, we need to make sure the server knows how to read it.

Go to ```index.js```

```javascript
io.on('connection', function(socket){
  var gameId = null;
  socket.on('create room', function(){
    gameId = Math.random() * 1000000 | 0;
    socket.join(gameId);
    socket.emit('gameId', gameId);
  })
});
```

With this code, the server generates a random number with up to 7 digits to act as a game room id, it then creates a new game room and adds the first client to it. With it's own ```socket.emit()``` it sends the id number back to the client so the player can share it with their opponent, who will join later.

Now the client has received a ```'gameId'``` event, we have to handle it.

In ```app.js``` we add the following code inside the ```init()``` function:

```javascript
socket.on('gameId', function(data){
    var gameScreen = document.getElementById('game_screen').innerHTML;
    gameArea.innerHTML = gameScreen;
    var gameIdHeader = document.getElementById('game_id');
    gameIdHeader.textContent = data;
  });
```

This updates the game area div with the ```'game_screen'``` template, and displays the game id.

Now restart the node server (In your terminal, Ctrl+C, then ```node index.js``` again). Refresh your browser, and try it out!

## 6: Bring in the Opponent

Now we need to allow the opponent to join the game.

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

## 7: Let's Get this Game Started.

Update your ```app.js``` file with the following:

```javascript
  socket.on('message', function(message){
    var gameScreen = document.getElementById('game_screen').innerHTML;
    gameArea.innerHTML = gameScreen;
    var opponent = document.getElementById('opponent');
    opponent.textContent = message;
    
    startNewGame();
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
  
  This updates the game area for every client in the 'game room' with a fresh gameboard and the message to begin the game. The ```startNewGame()``` function calls ```createGame()``` in ```tictactoe.js``` (which it has access to because we put it above ```app.js``` in the ```tictactoe.html``` file. Gotta love that!). It then adds event listeners to all the boxes in the tictactoe game board, so when we click on them, we can extract info about which box we clicked, and emit a 'move' event to the server.

To see the changes here on your browser, you'll have to restart the server again. This has to happen any time we edit the ```index.js``` file.

## 8: Make a Move.

The client is sending a 'move' event to the server, so again, we have to handle it. Go to ```index.js``` and insert the following inside the ```io.on('connection', function(socket){ ... })``` block:

```javascript
  socket.on('move', function(id){
    io.sockets.in(gameId).emit('update board', id)
  });
```

Getting the hang of it yet?

This sends all the clients in the 'game room' ```'update board'``` events.

Now in ```app.js``` we handle this:

```javascript
  socket.on('update board', function(id){
    makeMove(id)
  });
```

But this requires a little bit of tweaking in the ```tictactoe.js``` file. We have to change the ```makeMove()``` function to accept the ```id``` of the box as an argument, rather than the original event object.

So it changes from:

```javascript
function makeMove(event){
  clickToBoard(event.target.id);
  checkWin(tttBoard);
}
```
to:
```javascript

function makeMove(id){
  clickToBoard(id);
  checkWin(tttBoard);
}
```
This also means we need to remove the calls to adding and removing the box event listeners, which are assigned in the ```drawBoard``` and ```clickToBoard```

~~box.addEventListener("click", makeMove)~~

~~box.removeEventListener("click", makeMove)~~


Restart the server, refresh your browser, and test it out!

## 9: New Game
Right now when we click on the 'New Game' button, nothing happens - the players would need to make a new room to start a new game. Let's fix that.

In your ```app.js``` file:

```javascript
    // This goes inside the socket.on('message' ...) so that once the game begins, it adds the event listener to the 'new game' button.
    var newGame = document.getElementById('refresh');
    newGame.addEventListener('click', function(){
      socket.emit('new game');
    });
```
  

Back in ```index.js```, we need to add:

```javascript
  // inside the io.on('connection' ...) block
  socket.on('new game', function(){
    io.sockets.in(gameId).emit('start new game');
  });
```

And we handle the ```'start new game'``` event in ```app.js``` inside the ```init()``` function.

```javascript
  socket.on('start new game', startNewGame);
```

With this, we've taken the 'New Game' button (with the id="refresh") and added an event listener to start a new game by telling the server that the button was clicked.

On top of that, since we are handling the 'New Game' button, we can remove the event listener on the ```refreshButton``` in ```tictactoe.js```.

~~var refreshButton = document.getElementById('refresh');~~

~~refreshButton.addEventListener('click', refreshBoard);~~

Now if you refresh the server and browser, you should be able to play as many games as you want in the room with your opponent!

Congratulations, you now have a working multiplayer game (you can add as many people as you like, unfortunately this simple game doesn't have the intelligence to handle that gracefully).



  



Resources we used for this project are:
This tutorial by Eric Terpstra:

http://modernweb.com/2013/09/30/building-multiplayer-games-with-node-js-and-socket-io/


And the wonderful stack overflow answer by learnRPG:

http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io

