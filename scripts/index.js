import { allIcons } from "./icons.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const input = document.querySelector("input#input");
const widthEle = document.querySelector("input#width");
const heightEle = document.querySelector("input#height");
const textArea = document.querySelector("textarea");
const button = document.querySelector("button");
const copiedEle = document.querySelector("span.help");
const count = document.querySelector("#count");
const img = document.querySelector("img");
const bgColorEle = document.querySelector("input#bgcolor");
const bgRangeEle = document.querySelector("input#bgrange");
const iconColorEle = document.querySelector("input#iconcolor");
const iconRangeEle = document.querySelector("input#iconrange");
const bgRadRangeEle = document.querySelector("input#bgRadRange");
const iconStyle = document.querySelector('select#iconStyle');

let width = widthEle.value;
let height = heightEle.value;

let datalist = `<datalist id="icons">`;
for (const x of allIcons()) {
  datalist += `<option value="${x}"></option>`;
}
datalist += "</datalist>";
const datalistEle = document.createElement("datalist");
datalistEle.innerHTML = datalist;
document.querySelector('label[for="input"]').appendChild(datalistEle);

if (!window.isSecureContext) {
  button.style.display = "none";
}

input.addEventListener("input", () => {
  input.value = input.value.toLowerCase().replaceAll(" ", "_");
  drawToCanvas();
});

widthEle.addEventListener("input", () => {
  width = widthEle.value;
  canvas.width = width;
  drawToCanvas();
});

heightEle.addEventListener("input", () => {
  height = heightEle.value;
  canvas.height = height;
  drawToCanvas();
});

bgColorEle.addEventListener("input", () => {
  drawToCanvas();
});
bgRangeEle.addEventListener("input", () => {
  bgColorEle.style.opacity = bgRangeEle.value / 100;
  drawToCanvas();
});
iconColorEle.addEventListener("input", () => {
  drawToCanvas();
});
iconRangeEle.addEventListener("input", () => {
  iconColorEle.style.opacity = iconRangeEle.value / 100;
  drawToCanvas();
});
bgRadRangeEle.addEventListener('input', () => {
  drawToCanvas();
})
iconStyle.addEventListener('change', () => {
  drawToCanvas();
})

button.addEventListener("click", () => {
  if (textArea.value == "") return;
  navigator.clipboard.writeText(textArea.value);
  copiedEle.style.display = "inline-block";
  copiedEle.style.animation = "3s 1 helpRoll";
  console.log(copiedEle.style.display);
  copiedEle.addEventListener("animationend", (e) => {
    console.log(e);
    copiedEle.style.display = "none";
    console.log(copiedEle.style.display);
  });
});

function drawToCanvas() {
  if (input.value == "") {
    textArea.value = "";
    count.innerText = "";
    return;
  }

  const color = getColor(iconColorEle, iconRangeEle);
  const backColor = getColor(bgColorEle, bgRangeEle);


  // Round rect seems to persist weirdly 
  // sort of like an after image even after clearRect
  // resetting the canvas removes the after image
  canvas.height = height;
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = backColor;
  const radius = Math.floor(((canvas.width / 2) / 100) * bgRadRangeEle.value);

  ctx.roundRect(0, 0, canvas.width, canvas.height, [radius]);
  ctx.fill();
  // ctx.stroke();

  ctx.font = `normal normal normal ${(width > height ? width : height) * .8
    }px "Material Symbols ${iconStyle.value}"`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(input.value, canvas.width / 2, canvas.height / 1.8);
  canvasToBase64();
}

function canvasToBase64() {
  const dataUrl = canvas.toDataURL();
  textArea.value = dataUrl;
  img.src = dataUrl;
  count.innerText = ` (${dataUrl.length} characters at ${width}px by ${height}px)`;
}

function getColor(color, range) {
  const rgb = hex2Rgb(color.value);
  const opacity = range.value / 100;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
}

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hex2Rgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}
