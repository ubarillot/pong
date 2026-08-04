const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const PADDLE_W = 10;
const PADDLE_H = 80;
const PADDLE_SPEED = 6;
const BALL_SIZE = 10;
const WIN_SCORE = 7;

const scoreLeft = document.getElementById("score-left");
const scoreRight = document.getElementById("score-right");
const overlay = document.getElementById("overlay");
const overlayMessage = document.getElementById("overlay-message");

const state = {
  running: false,
  player1Score: 0,
  player2Score: 0,
};

const player1 = { x: 20, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, score: 0 };
const player2 = { x: W - 20 - PADDLE_W, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, score: 0 };

const ball = {
  x: W / 2,
  y: H / 2,
  size: BALL_SIZE,
  vx: 0,
  vy: 0,
};

let keys = {};

function resetBall(direction) {
  ball.x = W / 2;
  ball.y = H / 2;
  const angle = (Math.random() - 0.5) * 0.8;
  const speed = 5;
  ball.vx = speed * Math.cos(angle) * direction;
  ball.vy = speed * Math.sin(angle);
}

function drawPaddle(p) {
  ctx.fillStyle = "#0f0";
  ctx.shadowColor = "#0f0";
  ctx.shadowBlur = 10;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.shadowBlur = 0;
}

function drawBall() {
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 10;
  ctx.fillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size);
  ctx.shadowBlur = 0;
}

function drawCenterLine() {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawCenterLine();
  drawPaddle(player1);
  drawPaddle(player2);
  drawBall();
}

function update() {
  if (keys["z"]) player1.y -= PADDLE_SPEED;
  if (keys["s"]) player1.y += PADDLE_SPEED;
  if (keys["ArrowUp"]) player2.y -= PADDLE_SPEED;
  if (keys["ArrowDown"]) player2.y += PADDLE_SPEED;

  player1.y = Math.max(0, Math.min(H - player1.h, player1.y));
  player2.y = Math.max(0, Math.min(H - player2.h, player2.y));

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= H) {
    ball.vy *= -1;
    ball.y = Math.max(ball.size / 2, Math.min(H - ball.size / 2, ball.y));
  }

  const leftPaddle = { left: player1.x, right: player1.x + player1.w, top: player1.y, bottom: player1.y + player1.h };
  const rightPaddle = { left: player2.x, right: player2.x + player2.w, top: player2.y, bottom: player2.y + player2.h };

  const collide = (paddle) =>
    ball.x - ball.size / 2 <= paddle.right &&
    ball.x + ball.size / 2 >= paddle.left &&
    ball.y >= paddle.top &&
    ball.y <= paddle.bottom;

  if (collide(leftPaddle) && ball.vx < 0) {
    ball.vx *= -1;
    const rel = (ball.y - leftPaddle.top) / player1.h - 0.5;
    ball.vy = rel * 8;
    ball.x = leftPaddle.right + ball.size / 2;
  }

  if (collide(rightPaddle) && ball.vx > 0) {
    ball.vx *= -1;
    const rel = (ball.y - rightPaddle.top) / player2.h - 0.5;
    ball.vy = rel * 8;
    ball.x = rightPaddle.left - ball.size / 2;
  }

  if (ball.x < 0) {
    player2.score++;
    updateScore();
    resetBall(1);
  } else if (ball.x > W) {
    player1.score++;
    updateScore();
    resetBall(-1);
  }
}

function updateScore() {
  scoreLeft.textContent = player1.score;
  scoreRight.textContent = player2.score;
  if (player1.score >= WIN_SCORE) endGame("PLAYER 1 WINS");
  else if (player2.score >= WIN_SCORE) endGame("PLAYER 2 WINS");
}

function endGame(message) {
  state.running = false;
  overlayMessage.textContent = message + " - Press SPACE to restart";
  overlay.classList.remove("hidden");
}

function startGame() {
  player1.score = 0;
  player2.score = 0;
  player1.y = H / 2 - PADDLE_H / 2;
  player2.y = H / 2 - PADDLE_H / 2;
  updateScore();
  resetBall(Math.random() < 0.5 ? 1 : -1);
  overlay.classList.add("hidden");
  state.running = true;
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") {
    e.preventDefault();
    if (!state.running) startGame();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function gameLoop() {
  if (state.running) update();
  draw();
  requestAnimationFrame(gameLoop);
}

resetBall(1);
gameLoop();
