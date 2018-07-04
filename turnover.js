var maxx, maxy, rate;
var arSquares = [], arSelected = [];
var curPos = { i: 0, j: 0 };
var isSelecting = false;

const ST_NONE = 0;
const ST_BLACK = 1;
const ST_SELECTED = 2;
const ST_CURRENT = 3;
const arMoves = [
  { i: -1, j: 0 },  // left
  { i: 0, j: -1 },  // up
  { i: 1, j: 0 },   // right
  { i: 0, j: 1 }    // down
];

var inMaxx, inMaxy, btnReset;
var elemBoard, ctx;

var sz = 20, tipsPadding = 4;

///////////////////////////////////////////////////////////////////////////////
// window loader
///////////////////////////////////////////////////////////////////////////////
window.onload = function () {
  // initialize input & button elements
  inMaxx = document.getElementById("inMaxx");
  inMaxy = document.getElementById("inMaxy");
  inRate = document.getElementById("inRate");
  btnReset = document.getElementById("btnReset");

  // register button event
  btnReset.onclick = function (e) {
    resetBoard();
  }

  // initialize board element & 2d-context
  elemBoard = document.getElementById("board");
  ctx = elemBoard.getContext("2d");

  // disable context menu
  elemBoard.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // register keydown events
  document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e) {
      if (e.keyCode == 13) // Enter
        enterKeyDown();
      else if (e.keyCode == 27) // Esc
        escKeyDown();
      else if (e.keyCode >= 37 && e.keyCode <= 40) // Left, Up, Right, Down
        directionKeyDown(e.keyCode);
    }
  }; 

  // first-time reset board
  resetBoard();
};

///////////////////////////////////////////////////////////////////////////////
// events handlers
///////////////////////////////////////////////////////////////////////////////
function enterKeyDown() {
  console.log("enterKeyDown: " + curPos.i + ", " + curPos.j);

  if (isSelecting) {
    // turn over
  } else {
    isSelecting = true;
    arSelected.push(curPos);
  }

  drawSelectedAndCurrentSquares();
}

function escKeyDown() {
  console.log("escKeyDown: " + curPos.i + ", " + curPos.j);

  redrawSquaresBG(arSelected);

  isSelecting = false;
  arSelected = [];

  drawSelectedAndCurrentSquares();
}

function directionKeyDown(keyCode) {
  console.log("directionKeyDown: " + curPos.i + ", " + curPos.j + " ", keyCode);

  var dir = keyCode - 37;
  if (isSelecting) {
    var nextPos = { i : curPos.i + arMoves[dir].i, j : curPos.j + arMoves[dir].j };
    if (checkBound(nextPos)) {
      var prevPos = curPos;
      curPos = nextPos;
      arSelected.push(curPos);
      drawSelectedAndCurrentSquares();
    }
  } else {
    var nextPos = { i : curPos.i + arMoves[dir].i, j : curPos.j + arMoves[dir].j };
    if (checkBound(nextPos)) {
      var prevPos = curPos;
      curPos = nextPos;
      drawSquareBG(prevPos);
      drawSelectedAndCurrentSquares();
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// UI functions
///////////////////////////////////////////////////////////////////////////////
function resetBoard() {
  // read maxx & maxy from inputs
  maxx = inMaxx.value;
  maxy = inMaxy.value;
  rate = inRate.value;

  console.log("resetBoard: maxx = " + maxx + ", maxy = " + maxy);

  // set board's size
  elemBoard.width = sz * maxx;
  elemBoard.height = sz * maxy;

  // init squares
  initSquares();

  // draw the board
  drawBoard();

  // draw all squares BG
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      drawSquareBG({ i: i, j: j });
  
  // draw select & current squrares
  drawSelectedAndCurrentSquares();
}

function drawBoard() {
  ctx.strokeStyle = "black";
  ctx.beginPath();
  // vertical
  for (var i = 0; i < maxx; ++i) {
    ctx.moveTo(i * sz, 0);
    ctx.lineTo(i * sz, maxy * sz);
  }
  // horizontal
  for (var i = 0; i < maxy; ++i) {
    ctx.moveTo(0, i * sz);
    ctx.lineTo(maxx * sz, i * sz);
  }
  ctx.stroke();
}

function drawSquareBG(pos) {
  var xy = pos2xy(pos);
  var sq = arSquares[pos.i][pos.j];
  ctx.fillStyle = sq.state == ST_NONE ? "#FFFFFF" : "#CCCCCC";
  ctx.fillRect(xy.x, xy.y, sz - 1, sz - 1);
}

function drawSquareTips(pos, isCur) {
  var xy = pos2xy(pos);
  var tip = isCur ? 'C' : 'S';
  ctx.font = "bold 18px 微软雅黑";
  ctx.fillStyle = isCur ? "blue" : "red";
  ctx.fillText(tip, xy.x + tipsPadding, xy.y + sz - tipsPadding);
}

function drawSelectedAndCurrentSquares() {
  for (var i in arSelected) {
    drawSquareBG(arSelected[i]);
    drawSquareTips(arSelected[i], false);
  }

  drawSquareTips(curPos, true);
}

function redrawSquaresBG(arPos) {
  for (var i in arPos)
    drawSquareBG(arPos[i]);
}

///////////////////////////////////////////////////////////////////////////////
// Utility functions
///////////////////////////////////////////////////////////////////////////////
function xy2pos(xy) {
  return {
    i: Math.floor(xy.x / sz),
    j: Math.floor(xy.y / sz)
  };
}

function pos2xy(pos) {
  return {
    x: pos.i * sz,
    y: pos.j * sz
  }
}

function checkBound(pos) {
  return pos.i >= 0 && pos.i < maxx && pos.j >= 0 && pos.j < maxy;
}

///////////////////////////////////////////////////////////////////////////////
// Logic functions
///////////////////////////////////////////////////////////////////////////////
function initSquares() {
  for (var i = 0; i < maxx; ++i) {
    arSquares[i] = [];
    for (var j = 0; j < maxy; ++j)
      arSquares[i][j] = createSquare(Math.random() < rate ? ST_BLACK : ST_NONE);
  }
}

function createSquare(state) {
  var sq = new Object();
  sq.state = state;
  return sq;
}

function isDone() {
  for (var j = 0; j < maxy; ++j) {
    var isBlack = false;
    for (var i = 0; i < maxx; ++i)
      if (arSquares[i][j].state == ST_BLACK)
        return false;
  }
  return true;
}
