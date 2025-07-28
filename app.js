
// app.js - Real-time ASL detection using MediaPipe Hands

// Global variables
let videoElement = null;
let canvasElement = null;
let canvasCtx = null;
let outputTextArea = null;
let statusText = null;
let confidenceLevel = null;

// Utility: count extended fingers (approximate)
function getExtendedFingers(landmarks) {
  // Very naive: consider finger extended if tip.y < pip.y (for fingers) in image coordinates
  // Returns array of booleans: [thumb, index, middle, ring, pinky]
  if (!landmarks) return [false, false, false, false, false];
  const tips = [4, 8, 12, 16, 20];
  const pips = [3, 6, 10, 14, 18];
  return tips.map((tipIdx, i) => landmarks[tipIdx].y < landmarks[pips[i]].y);
}

// Very simplified gesture classifier – detects a subset of letters reliably
function classifyGesture(landmarks) {
  const ext = getExtendedFingers(landmarks);
  const p = ext.map(v => (v ? 1 : 0)).join("");
  // Basic patterns (thumb ignored for simplicity)
  switch (p) {
    case "01111": return "B"; // all except thumb
    case "01000": return "D"; // index only
    case "01100": return "U"; // index+middle
    case "01110": return "W"; // index+middle+ring
    case "00001": return "I"; // pinky
    case "00000": return "A"; // fist
    default: return "?"; // unknown
  }
}

// MediaPipe Hands setup
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

async function startCamera() {
  videoElement = document.getElementById("inputVideo");
  canvasElement = document.getElementById("outputCanvas");
  outputTextArea = document.getElementById("outputText");
  statusText = document.getElementById("statusText");
  confidenceLevel = document.getElementById("confidenceLevel");
  canvasCtx = canvasElement.getContext("2d");

  // Get camera stream
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
  await videoElement.play();

  // Resize canvas to match video
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // Start frame processing
  requestAnimationFrame(processFrame);
  statusText.textContent = "Processing…";
}

function stopCamera() {
  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach((track) => track.stop());
  }
  statusText.textContent = "Stopped";
}

async function processFrame() {
  await hands.send({ image: videoElement });
  requestAnimationFrame(processFrame);
}

function onResults(results) {
  if (!canvasCtx) return;
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.image) {
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  }
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const letter = classifyGesture(landmarks);
    if (letter !== "?") {
      outputTextArea.value += letter;
      statusText.textContent = `Recognized: ${letter}`;
    } else {
      statusText.textContent = "Unknown gesture";
    }
  }
  canvasCtx.restore();
}

// UI event listeners
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startButton").addEventListener("click", startCamera);
  document.getElementById("stopButton").addEventListener("click", stopCamera);
  document.getElementById("clearButton").addEventListener("click", () => {
    document.getElementById("outputText").value = "";
  });
  document.getElementById("copyButton").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("outputText").value);
  });
  document.getElementById("downloadButton").addEventListener("click", () => {
    const blob = new Blob([document.getElementById("outputText").value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recognized_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
});
