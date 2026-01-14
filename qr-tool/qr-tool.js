const qrFrame = document.getElementById("qr-frame");
const qrcodeEl = document.getElementById("qrcode");
const presetSelect = document.getElementById("preset");
const customUrlInput = document.getElementById("custom-url");
const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("size-value");
const fgColorInput = document.getElementById("fg-color");
const bgColorInput = document.getElementById("bg-color");
const correctionSelect = document.getElementById("correction");
const labelInput = document.getElementById("label");
const glowCheckbox = document.getElementById("glow");
const urlPreview = document.getElementById("url-preview");
const generateButton = document.getElementById("generate");
const downloadButton = document.getElementById("download");
const copyButton = document.getElementById("copy-url");

const levelMap = {
  L: QRCode.CorrectLevel.L,
  M: QRCode.CorrectLevel.M,
  Q: QRCode.CorrectLevel.Q,
  H: QRCode.CorrectLevel.H,
};

const labelBlock = document.createElement("p");
labelBlock.className = "muted";
labelBlock.id = "label-preview";
labelBlock.style.marginTop = "0.5rem";
labelBlock.style.textTransform = "uppercase";
qrcodeEl.parentElement.appendChild(labelBlock);

const getSelectedUrl = () => {
  if (presetSelect.value === "custom") {
    return customUrlInput.value.trim() || "https://cmforgedbyfire.com";
  }
  return presetSelect.value;
};

const renderQr = () => {
  const url = getSelectedUrl();
  const size = Number(sizeInput.value);
  qrcodeEl.innerHTML = "";

  new QRCode(qrcodeEl, {
    text: url,
    width: size,
    height: size,
    colorDark: fgColorInput.value,
    colorLight: bgColorInput.value,
    correctLevel: levelMap[correctionSelect.value],
  });

  urlPreview.textContent = url;
  sizeValue.textContent = size;
  labelBlock.textContent = labelInput.value ? labelInput.value.toUpperCase() : "Forged By Fire";

  if (glowCheckbox.checked) {
    qrFrame.classList.add("qr-frame-glow");
  } else {
    qrFrame.classList.remove("qr-frame-glow");
  }
};

const downloadCurrent = () => {
  const canvas = qrcodeEl.querySelector("canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "forged-qrcode.png";
  link.click();
};

const copyUrl = async () => {
  const url = getSelectedUrl();
  try {
    await navigator.clipboard.writeText(url);
    copyButton.textContent = "Copied!";
    setTimeout(() => (copyButton.textContent = "Copy URL"), 1200);
  } catch (error) {
    console.error("Clipboard failed", error);
  }
};

generateButton.addEventListener("click", renderQr);
downloadButton.addEventListener("click", downloadCurrent);
copyButton.addEventListener("click", copyUrl);

customUrlInput.addEventListener("input", () => {
  if (presetSelect.value === "custom") {
    renderQr();
  }
});

presetSelect.addEventListener("change", () => {
  if (presetSelect.value !== "custom") {
    customUrlInput.value = "";
  }
  renderQr();
});

[
  sizeInput,
  fgColorInput,
  bgColorInput,
  correctionSelect,
  labelInput,
  glowCheckbox,
].forEach((el) => el.addEventListener("input", renderQr));

window.addEventListener("load", renderQr);
