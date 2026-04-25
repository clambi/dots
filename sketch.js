let circles = [];

  // 👇 DEFINE RULES HERE (top-level)
function isValidNeighbor(typeA, typeB) {

  // ❌ yellow cannot touch cool
  if (typeA === "yellow" && typeB === "cool") return false;
  if (typeA === "cool" && typeB === "yellow") return false;

  // ❌ green cannot touch cool OR magenta
  if (typeA === "green" && (typeB === "cool" || typeB === "magenta")) return false;
  if (typeB === "green" && (typeA === "cool" || typeA === "magenta")) return false;

  return true;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  colorMode(HSB, 360, 100, 100);

  let spacing = 60;
  
// new color mappinng block

let palette = [
  "#ff8686", // pink
  "#ff715e", // coral
  "#ff42ae", // magenta
  "#5eff6e", // green
  "#65ebdf", // teal
  "#658beb", // blue
  "#c790ff", // purple
  "#fff45e"  // yellow
];
  
  let zones = [
  { hex: "#5eff6e", x1: 0.0, x2: 0.25, y1: 0.0, y2: 0.5 },
  { hex: "#ff715e", x1: 0.25, x2: 0.5, y1: 0.0, y2: 0.5 },
  { hex: "#65ebdf", x1: 0.5, x2: 0.75, y1: 0.0, y2: 0.5 },
  { hex: "#ff42ae", x1: 0.75, x2: 1.0, y1: 0.0, y2: 0.5 },

  { hex: "#c790ff", x1: 0.0, x2: 0.25, y1: 0.5, y2: 1.0 },
  { hex: "#658beb", x1: 0.25, x2: 0.5, y1: 0.5, y2: 1.0 },
  { hex: "#ff8686", x1: 0.5, x2: 0.75, y1: 0.5, y2: 1.0 },
  { hex: "#fff45e", x1: 0.75, x2: 1.0, y1: 0.5, y2: 1.0 }
];
  
  //your loops start below
 for (let x = spacing; x < width; x += spacing) {
  for (let y = spacing; y < height; y += spacing) {
    
let baseX = x + random(-5, 5);
let baseY = y + random(-5, 5);
let nx = baseX / width;
let ny = baseY / height;

let chosenHex = "#ff8686"; // fallback

for (let z of zones) {
 let noiseScale = 0.005;   // controls size of waves
let noiseStrength = 0.05; // controls how wavy edges are

let offsetX = map(noise(baseX * noiseScale, baseY * noiseScale), 0, 1, -noiseStrength, noiseStrength);
let offsetY = map(noise(baseX * noiseScale + 100, baseY * noiseScale + 100), 0, 1, -noiseStrength, noiseStrength);

if (
  nx >= z.x1 + offsetX &&
  nx <  z.x2 + offsetX &&
  ny >= z.y1 + offsetY &&
  ny <  z.y2 + offsetY
) {
    chosenHex = z.hex;
    break;
  }
}

let col = color(chosenHex);

let chosenColor = [
  hue(col),
  saturation(col),
  brightness(col)
];

    circles.push({
      x: baseX,
      y: baseY,
      baseSize: 20,
      size: 20,
      noiseOffsetX: random(1000),
      noiseOffsetY: random(1000),
      displayX: baseX,
      displayY: baseY,

 hue: chosenColor[0],
sat: chosenColor[1],
bri: chosenColor[2],
      colorIntensity: 0,
      hold: 0
    });

  }
}
}

function draw() {
  background(240);

  for (let c of circles) {
    
    let movementRadius = 150;
let colorRadius = 120;

    // distance from cursor (based on original position)
    let d = dist(mouseX, mouseY, c.x, c.y);

    // ✨ movement influence based on distance
let influence = map(d, 0, movementRadius, 1, 0, true);
    // ✨ smooth organic motion
    let nX = noise(c.noiseOffsetX);
    let nY = noise(c.noiseOffsetY);

    let moveX = map(nX, 0, 1, -8, 8) * influence;
    let moveY = map(nY, 0, 1, -8, 8) * influence;

    let newX = c.x + moveX;
    let newY = c.y + moveY;
    
// direction from circle to mouse
let dx = mouseX - newX;
let dy = mouseY - newY;

let dMag = dist(mouseX, mouseY, newX, newY);
let radius = 10;

if (dMag < radius) {

  let raw = map(dMag, 0, radius, 1, 0, true);
  let force = raw * raw;

  // pull toward cursor
  newX += dx * 0.07 * force;
  newY += dy * 0.07 * force;

  // ✨ add slight perpendicular motion (this is the "alive" part)
  newX += -dy * 0.02 * force;
  newY += dx * 0.02 * force;
}

    // evolve noise slowly
    c.noiseOffsetX += 0.02;
    c.noiseOffsetY += 0.02;

    // ✨ interaction based on new position
    let d2 = dist(mouseX, mouseY, newX, newY);

// map distance to intensity (closer = stronger)
let intensity = map(d2, 0, colorRadius, 1, 0, true);
// when near mouse → set strong value
if (intensity > 0.2) {
  c.colorIntensity = 1;
  c.hold = 15 ; // 👈 how many frames it "lingers"
} else if (c.hold > 0) {
  c.hold -= 1; // countdown hold
} else {
c.colorIntensity = max(0, c.colorIntensity - 0.015);
}
    
// size scales smoothly
 let targetSize = c.baseSize + (c.baseSize * 1 * intensity);
  c.size = lerp(c.size, targetSize, 0.1);

    
let gray = 80;

let dim = map(intensity, 0, 1, 0.3, 1);  // controls how visible inactive dots are
let t = c.colorIntensity;

if (t < 0.15) {
  fill(0, 0, 0); // snap to black
} else {
  let saturation = c.sat;
  let brightness = c.bri * pow(t, 2);

  fill(c.hue, saturation, brightness);
}
    // smooth toward new position
c.displayX = lerp(c.displayX, newX, 0.7);
c.displayY = lerp(c.displayY, newY, 0.7);

noStroke();
ellipse(c.displayX, c.displayY, c.size);
  }
}
