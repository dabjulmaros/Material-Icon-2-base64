const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const input = document.querySelector("input#input");
const widthEle = document.querySelector("input#width");
const heightEle = document.querySelector("input#height");
const textArea = document.querySelector("textarea");
const button = document.querySelector("#copy");
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
  // bgColorEle.style.opacity = bgRangeEle.value / 100;
  drawToCanvas();
});
iconColorEle.addEventListener("input", () => {
  drawToCanvas();
});
iconRangeEle.addEventListener("input", () => {
  // iconColorEle.style.opacity = iconRangeEle.value / 100;
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
  copiedEle.addEventListener("animationend", (e) => {
    copiedEle.style.display = "none";
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
    }px "Material Icons${iconStyle.value == "Filled" ? "" : " " + iconStyle.value}"`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(input.value, canvas.width / 2, canvas.height / 2);
  canvasToBase64();
}

function canvasToBase64() {
  const dataUrl = canvas.toDataURL();
  textArea.value = dataUrl;
  img.src = dataUrl;
  count.innerText = ` (${dataUrl.length} characters or ${shortNum(dataUrl.length)} at ${width}px by ${height}px)`;
}

function shortNum(num) {
  if (num < 1024) {
    return num + " bytes"
  }
  else if (num < 1048576) {
    return (num / 1024).toFixed(2) + " kb";
  }
  else
    return (num / 1048576).toFixed(2) + " mb";
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


const radioSet = document.querySelector('#modal fieldset');
const pickerArea = document.querySelector('#modal #pickerArea');
const iconSearch = document.querySelector('#modal #iconSearch');
let lastStyle = "";
let filter = "";

document.querySelector('#closeModal').addEventListener('click', () => toggleModal());

input.addEventListener('click', () => toggleModal());

iconSearch.addEventListener('input', e => {
  filter = iconSearch.value;
  buildIcons();
})
radioSet.addEventListener('click', e => {
  if (e.target.value) {
    lastStyle = e.target.value;
    buildIcons();
  }
})

function makeIcons() {
  const currentFont = iconStyle.value.toLowerCase();

  radioSet.querySelector(`[value="${currentFont}"]`).checked = true;
  if (currentFont != lastStyle) {
    lastStyle = currentFont;
    buildIcons();
  }
}

function buildIcons() {
  pickerArea.innerHTML = "";

  for (const icon in allIcons) {
    if (icon.includes(filter)) {
      if (allIcons[icon].includes(lastStyle)) {
        const div = document.createElement('div');
        const iconSpan = document.createElement('span');
        const textSpan = document.createElement('span');
        iconSpan.innerText = textSpan.innerText = icon;
        iconSpan.classList.add(`material-icons${["round", "outlined", "sharp"].includes(lastStyle) ? "-" + lastStyle : ""}`)
        iconSpan.classList.add(`icon`)
        textSpan.classList.add(`name`)
        div.appendChild(iconSpan);
        div.appendChild(textSpan);
        div.addEventListener('click', e => {
          event.stopPropagation();
          input.value = icon;
          iconStyle.value = lastStyle[0].toUpperCase() + lastStyle.substring(1);
          drawToCanvas();
          toggleModal();
        })
        div.title = icon;
        pickerArea.appendChild(div);
      }
    }
  }
  if (pickerArea.innerHTML == "") {
    pickerArea.innerHTML = `<span class='notFound'><h3>(T_T)</h3><span>Couldn't Find "${filter}"</span></span>`
  }
}


/*
 * Modal
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2024 - Licensed under MIT
 */

// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal = null;


// Toggle modal
const toggleModal = () => {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
};

// Open modal
const openModal = (modal) => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth} px`);
  }
  html.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
  makeIcons();
};

// Close modal
const closeModal = (modal) => {
  visibleModal = null;
  const { documentElement: html } = document;
  html.classList.add(closingClass);
  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

// Close with a click outside
document.addEventListener("click", (event) => {
  if (visibleModal === null) return;
  const modalContent = visibleModal.querySelector("article");
  const isClickInside = modalContent.contains(event.target);
  !isClickInside && closeModal(visibleModal);
});

// Close with Esc key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && visibleModal) {
    closeModal(visibleModal);
  }
});

// Get scrollbar width
const getScrollbarWidth = () => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  return scrollbarWidth;
};

// Is scrollbar visible
const isScrollbarVisible = () => {
  return document.body.scrollHeight > screen.height;
};

