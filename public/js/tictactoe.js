

var tttBoard, clicks=0, IN_A_ROW_TO_WIN = 3;
var DIRECTIONS = [
    [0, 1],      // Check to the right
    [1, 0],      // Check down the column
    [1, 1],      // Check diagonal to the right
    [1, -1]      // Check diagonal to the left
];

function createBoard(){
  var rows = [];
	for(var i = 0; i<3; i++){
		var cols = [];
		for(var j = 0; j<3; j++){
			cols.push(0);
		}
		rows.push(cols);
	}
	return rows;
};

function checkDirection(board, pos, dir){
  var char = board[pos[0]][pos[1]];
  if(char === 0){return false}
  var checkSum = 1, winningCells = [pos];
  while (true){
    pos = [pos[0] + dir[0], pos[1] + dir[1]];
    if (pos[0] >= board.length || pos[1] >= board.length){
      break
    }
    var nextChar = board[pos[0]][pos[1]];
    if (nextChar != char){
      break
    }
    checkSum += 1;
    winningCells.push(pos);
    if (checkSum === IN_A_ROW_TO_WIN){
      return winningCells
    }
  }
  return false
}

function checkWin(board){
  for (var row = 0; row < board.length; row++){
    for (var col = 0; col < board.length; col++){
      var pos = [row, col];
      for (var dir = 0; dir < DIRECTIONS.length; dir++){
        if (checkDirection(board, pos, DIRECTIONS[dir])){
          var winner = document.getElementById('gamestatus')
          var winCells = checkDirection(board, pos, DIRECTIONS[dir]);
          winCells.forEach(function(cell){
            var id = "r" + cell[0] + "c" + cell[1];
            var winBox = document.getElementById(id);
            winBox.className += ' winner';
          });
          winner.innerHTML = 'WINNER!';
          winner.style.visibility = 'visible';
          return true
        }
      }
    }
  }
  for (var row = 0; row < board.length; row++){
    for (var col = 0; col < board.length; col++){
      if (board[row][col] === 0){
        return false
      }
    }
  }
  var tie = document.getElementById('gamestatus')
  tie.innerHTML = 'TIE!';
  tie.style.visibility = 'visible';
  return undefined

};
     

function drawBoard(brd){
  var gBoard = document.getElementById("gameboard");
  for(var i = 0; i<brd.length; i++){
    var bRow = document.createElement('div');
    bRow.className = "row";
    for(var j = 0; j<brd.length; j++){
      var bData = document.createElement('div');
      bData.className = "col";
      bData.id = "r"+i+"c"+j;
      bData.setAttribute('data-row', i);
      bData.setAttribute('data-col', j);
     bData.addEventListener("click", makeMove);
      bRow.appendChild(bData);
    }
	gBoard.appendChild(bRow);
  }
};


function makeMove(event){
  clickToBoard(event.target.id);
  checkWin(tttBoard);
}

function clickToBoard(boxId){
  var box = document.getElementById(boxId);
  var row = box.getAttribute('data-row');
  var col = box.getAttribute('data-col');
  if (box.className === 'col'){
    if (clicks%2 === 0){
      box.className = 'col x';
      tttBoard[row][col] = 1;
      clicks++;
    } else {
      box.className = 'col o';
      tttBoard[row][col] = -1;
      clicks++;
    }
  }
  box.removeEventListener("click", makeMove);
}

function refreshBoard(bSize){
  document.getElementById('gamestatus').style.visibility = 'hidden';
  var gameboard = document.getElementById("gameboard");
  gameboard.innerHTML = '';
  tttBoard = createBoard();
  drawBoard(tttBoard);
}

var createGame = function() {
  var size = 3
  
 var refreshButton = document.getElementById('refresh');
 refreshButton.addEventListener('click', refreshBoard);
  
  
  refreshBoard(size);
  
};

window.addEventListener('load', createGame);