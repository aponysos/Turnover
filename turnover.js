var maxx, maxy, rate;
var sz = 20, tipsPadding = 4;
var inMaxx, inMaxy, btnReset;
var elemBoard, ctx;
var arSquares = [], blackSquares = [], selectedSquares = [];
const ST_NONE = 0;
const ST_MINE = -1;
const arMoves = [
  { i: -1, j: -1 },
  { i: 0, j: -1 },
  { i: 1, j: -1 },
  { i: 1, j: 0 },
  { i: 1, j: 1 },
  { i: 0, j: 1 },
  { i: -1, j: 1 },
  { i: -1, j: 0 }
];
const bgStyle = "#FFFFFF";
const tipStyles = [
  "#C0C0C0", // 0
  "#000080", "#008000", "#800000",
  "#008080", "#800080", "#808000",
  "#004040", "#400040", "#404000"
];

var curPos = { i: 0, j: 0 };

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
}

function escKeyDown() {
  console.log("escKeyDown: " + curPos.i + ", " + curPos.j);
}

function directionKeyDown(keyCode) {
  console.log("directionKeyDown: " + curPos.i + ", " + curPos.j + " ", keyCode);
}

///////////////////////////////////////////////////////////////////////////////
// UI functions
///////////////////////////////////////////////////////////////////////////////
function resetBoard() {
  // read maxx & maxy from inputs
  maxx = inMaxx.value + 2;
  maxy = inMaxy.value + 2;
  rate = inRate.value;

  console.log("resetBoard: maxx = " + maxx + ", maxy = " + maxy);

  // set board's size
  elemBoard.width = sz * maxx;
  elemBoard.height = sz * maxy;

  // init squares
  initSquares();

  // draw the board & all squares
  drawBoard();
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      drawSquare({ i: i, j: j });
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

function drawSquares(arPos) {
  for (var pos in arPos)
    drawSquare(arPos[pos]);
}

function drawSquare(pos) {
  var sq = arSquares[pos.i][pos.j];
  var tip = '';
  if (sq.revealed)
    tip = (sq.state == ST_MINE ? '*' : sq.state);
  else if (sq.flag)
    tip = 'F';

  drawTip(pos, tip);
}

function drawTip(pos, tip) {
  var sq = arSquares[pos.i][pos.j];
  var xy = pos2xy(pos);

  ctx.fillStyle = bgStyle;
  ctx.fillRect(xy.x, xy.y, sz - 1, sz - 1);
  ctx.font = "bold 18px 微软雅黑";
  ctx.fillStyle = getTipStyle(tip);
  ctx.fillText(tip, xy.x + tipsPadding, xy.y + sz - tipsPadding);
}

function getTipStyle(tip) {
  switch (tip) {
    case 'F':
      return "red";
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      return tipStyles[tip];
    default:
      return "black";
  }
}

///////////////////////////////////////////////////////////////////////////////
// Utility functions
///////////////////////////////////////////////////////////////////////////////
function getCanvasXY(canvas, x, y) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((x - rect.left) * (canvas.width / rect.width)),
    y: Math.floor((y - rect.top) * (canvas.height / rect.height))
  };
}

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

function getRedrawSquares(stack, redraw) {
  while (stack.length > 0) {
    var curPos = stack.pop();
    var curSq = arSquares[curPos.i][curPos.j];
    if (!curSq.revealed) {
      // reveal current square
      revealSquare(curSq);
      if (!redraw.indexOf(curPos) > -1)
        redraw.push(curPos);
      // push ajacent squares
      if (curSq.state == ST_NONE)
        for (var m in arMoves) {
          var nextPos = { i: curPos.i + arMoves[m].i, j: curPos.j + arMoves[m].j };
          if (checkBound(nextPos))
            stack.push(nextPos);
        }
    }
  }
}
///////////////////////////////////////////////////////////////////////////////
// Logic functions
///////////////////////////////////////////////////////////////////////////////
function initSquares() {
  // pass 1: random black squares
  for (var i = 0; i < maxx; ++i) {
    arSquares[i] = [];
    for (var j = 0; j < maxy; ++j)
      arSquares[i][j] = createSquare(Math.random() < rate ? ST_MINE : ST_NONE);
  }

  // pass 2: count ajacent mines
  for (var i = 0; i < maxx; ++i) {
    for (var j = 0; j < maxy; ++j)
      if (arSquares[i][j].state == ST_NONE)
        arSquares[i][j].state = countAjacentMines({ i: i, j: j });
  }
}

function createSquare(state) {
  var sq = new Object();
  sq.state = state;
  sq.revealed = false;
  sq.flag = false;
  return sq;
}

function countAjacentMines(pos) {
  return countAjacent(pos, function (next) {
    var sq = arSquares[next.i][next.j];
    return sq.state == ST_MINE;
  });
}

function countAjacentFlagsAndMines(pos) {
  return countAjacent(pos, function (next) {
    var sq = arSquares[next.i][next.j];
    return (sq.revealed && sq.state == ST_MINE) || (!sq.revealed && sq.flag);
  });
}

function countAjacent(pos, pred) {
  var count = 0;
  for (var m in arMoves) {
    var next = { i: pos.i + arMoves[m].i, j: pos.j + arMoves[m].j };
    if (checkBound(next))
      if (pred(next))
        ++count;
  }
  return count;
}

function checkBombOrDone() {
  if (isBombed())
    alert("Bombed!");
  else if (isDone())
    alert("Done!");
}

function isBombed() {
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      if (arSquares[i][j].revealed && arSquares[i][j].state == ST_MINE)
        return true;
  return false;
}

function isDone() {
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      if (!arSquares[i][j].revealed &&
        (!arSquares[i][j].flag || arSquares[i][j].state != ST_MINE)
      )
        return false;
  return true;
}
