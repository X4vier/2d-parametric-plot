let x = (t) => Math.sin(t);
let y = (t) => Math.tan(t);

const red = "rgba(255, 0, 0, 1)";
const transparentRed = "rgba(255, 0, 0, 0.5)";

const CANVAS_HEIGHT = 660;
const CANVAS_WIDTH = 660;
let PIXELS_PER_UNIT = 100;
const PIXELS_PER_GRIDSPACE = PIXELS_PER_UNIT / 10;
const TICKS_PER_UNIT_PARAMETRIC_TIME = 200;
const TICKS_PER_SECOND = 144;
const MILLISECONDS_PER_SECOND = 1000;

let TAIL_LENGTH = 40;
let TAIL_SPACING = 0.08;

let playing = false;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.translate(canvas.width / 2, canvas.height / 2);
context.scale(1, -1);

const data = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"> \
        <defs> \
            <pattern id="smallGrid" width="${PIXELS_PER_GRIDSPACE}" height="${PIXELS_PER_GRIDSPACE}" patternUnits="userSpaceOnUse"> \
                <path d="M ${PIXELS_PER_GRIDSPACE} 0 L 0 0 0 ${PIXELS_PER_GRIDSPACE}" fill="none" stroke="gray" stroke-width="0.5" /> \
            </pattern> \
            <pattern id="grid" width="${PIXELS_PER_UNIT}" height="${PIXELS_PER_UNIT}" patternUnits="userSpaceOnUse"> \
                <rect width="${PIXELS_PER_UNIT}" height="${PIXELS_PER_UNIT}" fill="url(#smallGrid)" /> \
                <path d="M ${PIXELS_PER_UNIT} 0 L 0 0 0 ${PIXELS_PER_UNIT}" fill="none" stroke="gray" stroke-width="1" /> \
            </pattern> \
        </defs> \
        <rect width="100%" height="100%" fill="url(#smallGrid)" /> \
    </svg>`;

const DOMURL = window.URL || window.webkitURL || window;

const img = new Image();
const svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
const url = DOMURL.createObjectURL(svg);

const drawGrid = function (p) {
  const xmax = (CANVAS_WIDTH / 2).toFixed(0);
  const xmin = -1 * xmax;
  const ymax = (CANVAS_HEIGHT / 2).toFixed(0);
  const ymin = -1 * ymax;

  p.strokeStyle = "black";
  p.drawImage(img, xmin, ymin);
  p.beginPath();
  p.lineWidth = 1;
  p.moveTo(xmin, 0);
  p.lineTo(xmax, 0);
  p.stroke();
  p.moveTo(0, ymin);
  p.lineTo(0, ymax);
  p.stroke();
  drawGridTicks(p);
};
img.src = url;

const drawGridTicks = (p) => {
  const tickLength = 8;
  const numXTicks = Math.floor(CANVAS_WIDTH / PIXELS_PER_UNIT);
  const numYTicks = Math.floor(CANVAS_HEIGHT / PIXELS_PER_UNIT);

  p.lineWidth = 2;
  p.strokeStyle = "black";
  for (
    tick = Math.floor(-numXTicks / 2);
    Math.ceil(tick <= numXTicks / 2);
    tick++
  ) {
    p.beginPath();
    p.moveTo(PIXELS_PER_UNIT * tick, tickLength / -2);
    p.lineTo(PIXELS_PER_UNIT * tick, tickLength / 2);
    p.stroke();
  }

  for (
    tick = Math.floor(-numYTicks / 2);
    Math.ceil(tick <= numYTicks / 2);
    tick++
  ) {
    p.beginPath();
    p.moveTo(tickLength / -2, PIXELS_PER_UNIT * tick);
    p.lineTo(tickLength / 2, PIXELS_PER_UNIT * tick);
    p.stroke();
  }
};

const drawCircle = (t, p, color, thickness) => {
  p.fillStyle = color;
  p.beginPath();
  p.arc(
    PIXELS_PER_UNIT * x(t),
    PIXELS_PER_UNIT * y(t),
    thickness,
    0,
    2 * Math.PI
  );
  p.fill();
};

const drawTail = (t, p, color, thickness) => {
  const tail_decay = 0.95;
  p.fillStyle = color;
  [...Array(TAIL_LENGTH).keys()].map((i) =>
    drawCircle(
      t - TAIL_SPACING * (i + 1),
      p,
      color,
      tail_decay ** i * thickness
    )
  );
};

const drawXandY = (t, p, color, thickness) => {
  p.fillStyle = color;
  p.beginPath();
  p.arc(PIXELS_PER_UNIT * x(t), 0, thickness, 0, 2 * Math.PI);
  p.fill();
  p.beginPath();
  p.arc(0, PIXELS_PER_UNIT * y(t), thickness, 0, 2 * Math.PI);
  p.fill();
};

const clearCanvas = () => {
  context.clearRect(
    -CANVAS_WIDTH,
    -CANVAS_HEIGHT,
    2 * CANVAS_WIDTH,
    2 * CANVAS_HEIGHT
  );
};

img.onload = () => {
  drawOnce();
};

const drawOnce = () => {
  clearCanvas();
  drawGrid(context);
  drawTail(t, context, transparentRed, 10);
  drawCircle(t, context, red, 10);
  drawXandY(t, context, "orange", 5);
};

let t = 0;
const animateLoop = () => {
  if (Math.floor(TICKS_PER_UNIT_PARAMETRIC_TIME * t) % 7 == 0) {
    updateCoordinates(t);
  }
  clearCanvas();
  drawGrid(context);
  drawTail(t, context, transparentRed, 10);
  drawCircle(t, context, red, 10);
  drawXandY(t, context, "orange", 5);

  if (playing) {
    t += 1 / TICKS_PER_UNIT_PARAMETRIC_TIME;
    setTimeout(
      () => requestAnimationFrame(animateLoop),
      MILLISECONDS_PER_SECOND / TICKS_PER_SECOND
    );
  }
};

const updateCoordinates = (t) => {
  document.getElementById("xpos").textContent = `x = ${x(t).toFixed(2)}`;
  document.getElementById("ypos").textContent = `y = ${y(t).toFixed(2)}`;
  document.getElementById("tpos").textContent = `t = ${t.toFixed(2)}`;
};

animateLoop();

const updateFunction = () => {
  const xFunctionString = document.getElementById("function_x").value;
  const yFunctionString = document.getElementById("function_y").value;

  x = new Function("t", `return ${processMathInput(xFunctionString)}`);
  y = new Function("t", `return ${processMathInput(yFunctionString)}`);
  t = 0;
  if (!playing) drawOnce();
};

const processMathInput = (text) => {
  let processedText = text.toLowerCase();
  processedText = processedText.replace("sin", "Math.sin");
  processedText = processedText.replace("cos", "Math.cos");
  processedText = processedText.replace("tan", "Math.tan");
  processedText = processedText.replace("log", "Math.log");
  processedText = processedText.replace("^", "**");
  processedText = processedText.replace("e", "Math.E");

  return processedText;
};

const play = () => {
  if (playing) return;
  playing = true;
  animateLoop();
};

const pause = () => {
  playing = false;
  updateCoordinates(t);
};

const zoomIn = () => {
  PIXELS_PER_UNIT += 10;
  if (!playing) drawOnce();
};

const zoomOut = () => {
  if (PIXELS_PER_UNIT > 10) {
    PIXELS_PER_UNIT -= 10;
  }
  if (!playing) drawOnce();
};

const reset = () => {
  t = 0;
  if (!playing) drawOnce();
};

var slide_length = document.getElementById("tail_range");

slide_length.onchange = (e) => {
  TAIL_LENGTH = Math.floor(e.target.value);
  document.getElementById(
    "tailLengthText"
  ).textContent = `Tail Length: ${TAIL_LENGTH}`;
  if (!playing) drawOnce();
};

var slide_spacing = document.getElementById("tail_spacing");

slide_spacing.onchange = (e) => {
  TAIL_SPACING = (e.target.value / 100).toFixed(2);
  document.getElementById(
    "tailSpacingText"
  ).textContent = `Tail Spacing: ${TAIL_SPACING}`;
  if (!playing) drawOnce();
};
