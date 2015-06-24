# RCworkshopMultiPlayerGame

Learn to make a multiplayer game with Node, Express.js and socket.io!

We'll be using a simple tic tac toe game as an example:

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


