const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
const exportButton = document.getElementById('exportButton');

const audio = new Audio('song.midi');

const frameRate = 30; // 30 frames per second
var duration = 60; // 1 minute
var totalFrames = frameRate * duration;
// TYPES: enlarge, shrinkMainCircle, music, classic
var type = 'shrinkMainCircle';
var title = 'The Ball Simulation';

function updateDuration() {
  duration = document.getElementById('duration').value;
  totalFrames = frameRate * duration;
}

console.log(title, type);

class Ball {
  constructor(radius, color) {
    this.radius = radius;
    this.color = color;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.dx = 10; // Increase this value for faster horizontal movement
    this.dy = 10; // Increase this value for faster vertical movement
    this.vx = 0;
    this.vy = 20;

    this.lastPositions = [{ x: this.x, y: this.y }];

    this.draw();

    setInterval(() => {
      //   this.lastPositions.push({ x: this.x, y: this.y });
    }, 20);
  }

  drawTrail() {
    let alpha = 0;
    this.lastPositions.forEach((position, index) => {
      context.beginPath();
      context.arc(position.x, position.y, this.radius, 0, 2 * Math.PI);
      context.fillStyle =
        'hsl(' + (index * 360) / this.lastPositions.length + ', 100%, 50%)';
      context.globalAlpha = alpha;
      if (alpha < 0.8) {
        alpha += 0.5;
      }
      context.fill();
      context.closePath();
    });
    // remove the 5th position
    if (this.lastPositions.length > 15) {
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
    this.vy += Math.random() * (0.08 - 0.03) + 0.03;
  }

  move() {
    this.draw();
    this.runGravity();
    this.x += this.vx;
    this.y += this.vy;
    this.bounce();
  }

  bounce() {
    const distanceFromCenter = Math.sqrt(
      (this.x - canvas.width / 2) ** 2 + (this.y - canvas.height / 2) ** 2,
    );
    if (distanceFromCenter + this.radius > centerCircleRadius) {
      const angle = Math.atan2(
        this.y - canvas.height / 2,
        this.x - canvas.width / 2,
      );
      const newAngle =
        angle + Math.PI + (Math.random() * (Math.PI / 9) + Math.PI / 36); // Add random angle between 5 and 80 degrees in radians
      this.vx = Math.cos(newAngle) * this.dx;
      this.vy = Math.sin(newAngle) * this.dy;
      if (type === 'shrinkMainCircle') {
        enlargeCenterCircle(2); // Decrease radius
      }
      if (type === 'enlarge') {
        this.enlargeBall(1.05);
        enlargeCenterCircle(-1.5);
      }
    }

    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.vx = -this.vx + 20;
      this.vx += 1;
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.vy = -this.vy + 20;
      this.vx += 0.1;
    }
    this.vx *= 1.00001;
    if (type == 'shrinkMainCircle') {
      enlargeCenterCircle(-0.04);
    }
  }

  enlargeBall(multiplier) {
    this.radius *= multiplier;
  }
}

const ball = new Ball(20, 'white');

function drawFrame(frameNumber) {
  type = document.getElementById('type').value || type;
  title = document.getElementById('title').value || title;
  console.log(document.getElementById('type').value);
  context.globalAlpha = 1;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawCenterCircle(context);
  context.fillStyle = 'white';
  context.font = 'bold 48px Helvetica';

  const maxWidth = canvas.width * 0.9;
  const lineHeight = 56; // Slightly more than font size to ensure spacing

  wrapText(context, title, canvas.width / 2, 80, maxWidth, lineHeight);
  ball.move();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let testLine = '';
  let testWidth = 0;

  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    testWidth = context.measureText(testLine).width;

    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x - context.measureText(line).width / 2, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x - context.measureText(line).width / 2, y);
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
