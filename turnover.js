// logic var
var maxx, maxy, rate;
var arSquares = [], arSelected = [];
var curPos = { i: 0, j: 0 };
var isSelecting = false;

// UI var
var inMaxx, inMaxy, btnReset;
var elemBoard, ctx;

// logic const
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

// UI const
const sz = 20, tipsPadding = 4;

///////////////////////////////////////////////////////////////////////////////
// window loader
///////////////////////////////////////////////////////////////////////////////
window.onload = function () {
  // initialize input & button elements
  inMaxx = document.getElementById("inMaxx");
  inMaxy = document.getElementById("inMaxy");
  inRate = document.getElementById("inRate");
  btnReset = document.getElementById("btnReset");

  // initialize board element & 2d-context
  elemBoard = document.getElementById("board");
  ctx = elemBoard.getContext("2d");

  // register button event
  btnReset.onclick = function (e) {
    resetBoard();
  }

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

      // redraw squares
      drawSelectedAndCurrentSquares();
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
    if (isDone())
      alert("Done!");
  } else {
    isSelecting = true;
    arSelected.push(curPos);
  }
}

function escKeyDown() {
  console.log("escKeyDown: " + curPos.i + ", " + curPos.j);

  redrawSquaresBG(arSelected);
  clearSelected()
}

function directionKeyDown(keyCode) {
  console.log("directionKeyDown: " + curPos.i + ", " + curPos.j + " ", keyCode);

  var dir = keyCode - 37;
  var nextPos = { i: curPos.i + arMoves[dir].i, j: curPos.j + arMoves[dir].j };
  if (!checkBound(nextPos))
    return;

  if (isSelecting) {
    var i = indexOfSelected(nextPos);
    if (i < 0) // move on
      arSelected.push(nextPos);
    else if (i == arSelected.length - 2) { // move back
      drawSquareBG(curPos);
      arSelected.pop();
    } else if (i > 0) // stay
      return;
  } else
    drawSquareBG(curPos);

  curPos = nextPos;
}

///////////////////////////////////////////////////////////////////////////////
// UI
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

  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(sz, sz);
  ctx.lineTo((maxx - 1) * sz, sz);
  ctx.lineTo((maxx - 1) * sz, (maxy - 1) * sz);
  ctx.lineTo(sz, (maxy - 1) * sz);
  ctx.lineTo(sz, sz);
  ctx.stroke();
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

function drawSquareBG(pos) {
  var xy = pos2xy(pos);
  var sq = arSquares[pos.i][pos.j];
  ctx.fillStyle = sq.state == ST_NONE ? "white" : "grey";
  ctx.fillRect(xy.x, xy.y, sz - 1, sz - 1);
}

function drawSquareTips(pos, isCur) {
  var xy = pos2xy(pos);
  var tip = isCur ? 'C' : 'S';
  ctx.font = "bold 18px 微软雅黑";
  ctx.fillStyle = isCur ? "blue" : "red";
  ctx.fillText(tip, xy.x + tipsPadding, xy.y + sz - tipsPadding);
}

function pos2xy(pos) {
  return {
    x: pos.i * sz,
    y: pos.j * sz
  }
}

///////////////////////////////////////////////////////////////////////////////
// Logic
///////////////////////////////////////////////////////////////////////////////
function initSquares() {
  arSquares = [], arSelected = [], curPos = { i: 0, j: 0 }, isSelecting = false;
  for (var i = 0; i < maxx; ++i) {
    arSquares[i] = [];
    for (var j = 0; j < maxy; ++j)
      arSquares[i][j] = createSquare(!isBoundary({ i, j }) && Math.random() < rate ? ST_BLACK : ST_NONE);
  }
}

function createSquare(state) {
  var sq = new Object();
  sq.state = state;
  return sq;
}

function isDone() {
  var arIsNone = [];

  // copy states
  for (var i = 0; i < maxx; ++i) {
    arIsNone[i] = [];
    for (var j = 0; j < maxy; ++j)
      arIsNone[i][j] = arSquares[i][j].state == ST_NONE;
  }

  // turn over states
  for (var i in arSelected) {
    var pos = arSelected[i];
    if (!isBoundary(pos))
      arIsNone[pos.i][pos.j] = !arIsNone[pos.i][pos.j];
  }

  // check rows
  for (var j = 1; j < maxy - 1; ++j) {
    var isNone = arIsNone[1][j];
    for (var i = 1; i < maxx - 1; ++i)
      if (arIsNone[i][j] != isNone)
        return false;
  }

  return true;
}

function checkBound(pos) {
  return pos.i >= 0 && pos.i < maxx && pos.j >= 0 && pos.j < maxy;
}

function isBoundary(pos) {
  return pos.i == 0 || pos.j == 0 || pos.i == maxx - 1 || pos.j == maxy - 1;
}

function clearSelected() {
  isSelecting = false;
  arSelected = [];
}

function indexOfSelected(pos) {
  for (var i = 0; i < arSelected.length; ++i)
    if (arSelected[i].i == pos.i && arSelected[i].j == pos.j)
      return i;
  return -1;
}
