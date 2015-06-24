# RCworkshopMultiPlayerGame

Learn to make a multiplayer game with Node, Express.js and socket.io!

We'll be using a simple tic tac toe game as an example:
In order to follow this tutorial, you'll have to have node installed.

1: fork this repo!

then npm install (this installs the dependencies in the package.json file)

2: create an index.js file with the following:
```
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

with this code, you should be able to go to your terminal and 

```
$ node index.js
```

navigate to localhost:3000 in your web browser and see the single-player version of your game!

3: To make this a multiplayer game, we have to create a 'game room' with an id that you can pass to your opponent so they can join you online to play.

This means we should modify the tictactoe.html file so that we have a 'create/join game' screen to either create or join a new game.

Open up tictactoe.html, you should see this:




Resources we used for this project are:
This tutorial by Eric Terpstra:

http://modernweb.com/2013/09/30/building-multiplayer-games-with-node-js-and-socket-io/


And the wonderful stack overflow answer by learnRPG:

http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io

