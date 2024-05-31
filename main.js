const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
const exportButton = document.getElementById('exportButton');

const audio = new Audio('song.midi');

const frameRate = 30; // 30 frames per second
const duration = 60; // 1 minute
const totalFrames = frameRate * duration;
// TYPES: enlarge, shrinkMainCircle, music, classic
const type = 'enlarge';

const title = 'The ball slowly gets bigger';

class Ball {
  constructor(radius, color) {
    this.radius = radius;
    this.color = color;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.dx = 5;
    this.dy = 5;
    this.vx = -5;
    this.vy = 20;

    this.lastPositions = [{ x: this.x, y: this.y }];

    this.draw();

    setInterval(() => {
      this.lastPositions.push({ x: this.x, y: this.y });
    }, 50);
  }

  drawTrail() {
    this.lastPositions.forEach((position, index) => {
      context.beginPath();
      context.arc(position.x, position.y, this.radius, 0, 2 * Math.PI);
      context.fillStyle = '#aa00ff';
      context.globalAlpha = 0.5;
      context.fill();
      context.closePath();
    });
    // remove the 5th position
    if (this.lastPositions.length > 5) {
      this.lastPositions.shift();
    }
  }

  draw() {
    this.drawTrail();
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }

  runGravity() {
    // this.vy += 0.05;
  }

  move() {
    this.draw();
    this.runGravity();
    this.x += this.vx;
    this.y += this.vy;
    this.bounce();
  }

  bounce() {
    const centerCircleRadius = 200;
    const distanceFromCenter = Math.sqrt(
      (this.x - canvas.width / 2) ** 2 + (this.y - canvas.height / 2) ** 2,
    );
    if (distanceFromCenter + this.radius > centerCircleRadius) {
      const angle = Math.atan2(
        this.y - canvas.height / 2,
        this.x - canvas.width / 2,
      );
      const newAngle =
        angle + Math.PI + (Math.random() * (Math.PI / 4) + Math.PI / 12); // Add random angle between 15 and 45 degrees in radians
      this.vx = Math.cos(newAngle) * this.dx;
      this.vy = Math.sin(newAngle) * this.dy;
    }
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.vx = -this.vx + 20;
      this.vx += 1;
      if (type === 'shrinkMainCircle') enlargeCenterCircle(-50); // Decrease radius
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.vy = -this.vy + 20;
      this.vx += 0.1;
      if (type === 'shrinkMainCircle') enlargeCenterCircle(-50); // Decrease radius
    }
    this.vx *= 1.00001;
    if (type === 'enlarge') this.enlargeBall(1.001);
  }

  enlargeBall(multiplier) {
    this.radius *= multiplier;
  }
}

const ball = new Ball(20, 'red');

function drawFrame(frameNumber) {
  context.globalAlpha = 1;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawCenterCircle(context);
  context.fillStyle = 'white';
  context.font = '24px Helvetica';
  context.fillText(title, 10, 50);
  ball.move();
}

var centerCircleRadius = 200;

function drawCenterCircle(context) {
  context.beginPath();
  context.arc(
    canvas.width / 2,
    canvas.height / 2,
    centerCircleRadius,
    0,
    2 * Math.PI,
  );
  context.strokeStyle = '#22aaff';
  context.lineWidth = 10;
  context.stroke();
  context.closePath();
}

function enlargeCenterCircle(addition) {
  centerCircleRadius -= addition;
}

exportButton.addEventListener('click', () => {
  const stream = canvas.captureStream(frameRate);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

  const chunks = [];
  mediaRecorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  mediaRecorder.onstop = function () {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'canvas_video.webm';
    downloadLink.click();
  };

  mediaRecorder.start();

  let currentFrame = 0;
  function captureFrame() {
    if (currentFrame < totalFrames) {
      drawFrame(currentFrame);
      currentFrame++;
      requestAnimationFrame(captureFrame);
    } else {
      mediaRecorder.stop();
    }
  }

  captureFrame();
});
