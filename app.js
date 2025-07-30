// app.js - Enhanced Real-time ASL detection using MediaPipe Hands

// Global variables
let videoElement = null;
let canvasElement = null;
let canvasCtx = null;
let outputTextArea = null;
let statusText = null;
let confidenceLevel = null;
let showLandmarks = true;
let lastDetectedLetter = '';
let letterConfidence = 0;
let stableFrames = 0;
const REQUIRED_STABLE_FRAMES = 5;

// Enhanced gesture recognition using detailed landmark analysis
function getDetailedHandMetrics(landmarks) {
    if (!landmarks || landmarks.length !== 21) return null;

    // Calculate distances and angles for better gesture recognition
    const metrics = {
        // Finger tip positions relative to palm
        thumbTip: landmarks[4],
        indexTip: landmarks[8],
        middleTip: landmarks[12],
        ringTip: landmarks[16],
        pinkyTip: landmarks[20],

        // Finger joint positions
        thumbIP: landmarks[3],
        indexPIP: landmarks[6],
        middlePIP: landmarks[10],
        ringPIP: landmarks[14],
        pinkyPIP: landmarks[18],

        // Palm and wrist
        wrist: landmarks[0],
        palm: landmarks[9],

        // Calculate if fingers are extended
        fingersExtended: getFingersExtended(landmarks),

        // Get finger positions relative to palm
        fingerDistances: getFingerDistances(landmarks),

        // Get angles between fingers
        fingerAngles: getFingerAngles(landmarks)
    };

    return metrics;
}

function getFingersExtended(landmarks) {
    const extended = [false, false, false, false, false]; // thumb, index, middle, ring, pinky

    // Thumb (different logic due to thumb orientation)
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    extended[0] = distance(thumbTip, thumbMCP) > distance(thumbIP, thumbMCP);

    // Other fingers - compare tip Y to PIP Y (lower Y = higher on screen = extended)
    const fingerTips = [8, 12, 16, 20];
    const fingerPIPs = [6, 10, 14, 18];

    for (let i = 0; i < 4; i++) {
        extended[i + 1] = landmarks[fingerTips[i]].y < landmarks[fingerPIPs[i]].y;
    }

    return extended;
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getFingerDistances(landmarks) {
    const palm = landmarks[9];
    return {
        thumbDist: distance(landmarks[4], palm),
        indexDist: distance(landmarks[8], palm),
        middleDist: distance(landmarks[12], palm),
        ringDist: distance(landmarks[16], palm),
        pinkyDist: distance(landmarks[20], palm)
    };
}

function getFingerAngles(landmarks) {
    // Calculate angles between adjacent fingers
    const indexDir = { 
        x: landmarks[8].x - landmarks[5].x, 
        y: landmarks[8].y - landmarks[5].y 
    };
    const middleDir = { 
        x: landmarks[12].x - landmarks[9].x, 
        y: landmarks[12].y - landmarks[9].y 
    };

    return {
        indexMiddleAngle: Math.atan2(middleDir.y - indexDir.y, middleDir.x - indexDir.x)
    };
}

// Enhanced gesture classifier with more ASL letters
function classifyGesture(landmarks) {
    const metrics = getDetailedHandMetrics(landmarks);
    if (!metrics) return '?';

    const ext = metrics.fingersExtended;
    const [thumb, index, middle, ring, pinky] = ext;

    // Enhanced pattern matching for ASL letters

    // A - Closed fist with thumb alongside
    if (!index && !middle && !ring && !pinky && thumb) {
        return 'A';
    }

    // B - All fingers extended except thumb
    if (!thumb && index && middle && ring && pinky) {
        return 'B';
    }

    // C - Curved hand shape
    if (!index && !middle && !ring && !pinky && 
        metrics.fingerDistances.indexDist > 0.1 && 
        metrics.fingerDistances.middleDist > 0.1) {
        return 'C';
    }

    // D - Index finger up, others closed, thumb extended
    if (thumb && index && !middle && !ring && !pinky) {
        return 'D';
    }

    // E - All fingers bent inward
    if (!thumb && !index && !middle && !ring && !pinky) {
        return 'E';
    }

    // F - OK sign - index and thumb touching, others extended
    if (thumb && !index && middle && ring && pinky) {
        // Check if thumb and index are close
        if (distance(landmarks[4], landmarks[8]) < 0.05) {
            return 'F';
        }
    }

    // G - Index finger pointing sideways
    if (!thumb && index && !middle && !ring && !pinky) {
        // Check if index is pointing horizontally
        const indexAngle = Math.atan2(landmarks[8].y - landmarks[5].y, landmarks[8].x - landmarks[5].x);
        if (Math.abs(indexAngle) < Math.PI/4) {
            return 'G';
        }
    }

    // H - Index and middle fingers pointing sideways
    if (!thumb && index && middle && !ring && !pinky) {
        return 'H';
    }

    // I - Pinky finger extended
    if (!thumb && !index && !middle && !ring && pinky) {
        return 'I';
    }

    // J - Pinky finger making J motion (difficult to detect in static)
    if (!thumb && !index && !middle && !ring && pinky) {
        return 'J';
    }

    // K - Index and middle in V shape, thumb extended
    if (thumb && index && middle && !ring && !pinky) {
        return 'K';
    }

    // L - Index finger up, thumb out
    if (thumb && index && !middle && !ring && !pinky) {
        // Check angle between thumb and index
        const thumbAngle = Math.atan2(landmarks[4].y - landmarks[2].y, landmarks[4].x - landmarks[2].x);
        const indexAngle = Math.atan2(landmarks[8].y - landmarks[5].y, landmarks[8].x - landmarks[5].x);
        if (Math.abs(thumbAngle - indexAngle) > Math.PI/3) {
            return 'L';
        }
    }

    // M - Three fingers closed over thumb
    if (!thumb && !index && !middle && !ring && !pinky) {
        return 'M';
    }

    // N - Two fingers closed over thumb
    if (!thumb && !index && !middle && !ring && !pinky) {
        return 'N';
    }

    // O - All fingers curved to form O
    if (!index && !middle && !ring && !pinky && thumb) {
        return 'O';
    }

    // P - Index finger down, middle finger extended
    if (!thumb && !index && middle && !ring && !pinky) {
        return 'P';
    }

    // Q - Similar to G but pointing down
    if (!thumb && index && !middle && !ring && !pinky) {
        return 'Q';
    }

    // R - Index and middle fingers crossed
    if (!thumb && index && middle && !ring && !pinky) {
        return 'R';
    }

    // S - Closed fist with thumb over fingers
    if (!thumb && !index && !middle && !ring && !pinky) {
        return 'S';
    }

    // T - Thumb between index and middle
    if (thumb && !index && !middle && !ring && !pinky) {
        return 'T';
    }

    // U - Index and middle fingers up together
    if (!thumb && index && middle && !ring && !pinky) {
        return 'U';
    }

    // V - Index and middle fingers in V shape
    if (!thumb && index && middle && !ring && !pinky) {
        // Check if fingers are spread apart
        if (distance(landmarks[8], landmarks[12]) > 0.08) {
            return 'V';
        }
    }

    // W - Three fingers up
    if (!thumb && index && middle && ring && !pinky) {
        return 'W';
    }

    // X - Index finger curved
    if (!thumb && index && !middle && !ring && !pinky) {
        return 'X';
    }

    // Y - Thumb and pinky extended
    if (thumb && !index && !middle && !ring && pinky) {
        return 'Y';
    }

    // Z - Index finger making Z motion (difficult in static)
    if (!thumb && index && !middle && !ring && !pinky) {
        return 'Z';
    }

    return '?';
}

// Draw hand landmarks on canvas
function drawLandmarks(landmarks) {
    if (!showLandmarks || !landmarks || !canvasCtx) return;

    const connections = [
        // Thumb
        [0, 1], [1, 2], [2, 3], [3, 4],
        // Index finger
        [0, 5], [5, 6], [6, 7], [7, 8],
        // Middle finger
        [0, 9], [9, 10], [10, 11], [11, 12],
        // Ring finger
        [0, 13], [13, 14], [14, 15], [15, 16],
        // Pinky
        [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    // Draw connections
    canvasCtx.strokeStyle = '#00FF00';
    canvasCtx.lineWidth = 2;
    connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        canvasCtx.beginPath();
        canvasCtx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
        canvasCtx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
        canvasCtx.stroke();
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
        const x = landmark.x * canvasElement.width;
        const y = landmark.y * canvasElement.height;

        canvasCtx.fillStyle = index === 4 || index === 8 || index === 12 || index === 16 || index === 20 ? '#FF0000' : '#0000FF';
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
        canvasCtx.fill();
    });
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

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 640, 
                height: 480,
                facingMode: 'user'
            } 
        });
        videoElement.srcObject = stream;
        await videoElement.play();

        // Resize canvas to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        // Start frame processing
        requestAnimationFrame(processFrame);
        statusText.textContent = "Camera started - Show hand gestures";

    } catch (error) {
        statusText.textContent = "Camera access denied or not available";
        console.error("Camera error:", error);
    }
}

function stopCamera() {
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach((track) => track.stop());
        videoElement.srcObject = null;
    }
    statusText.textContent = "Camera stopped";
}

async function processFrame() {
    if (videoElement && !videoElement.paused && !videoElement.ended) {
        await hands.send({ image: videoElement });
        requestAnimationFrame(processFrame);
    }
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

        // Draw landmarks
        drawLandmarks(landmarks);

        // Classify gesture
        const letter = classifyGesture(landmarks);

        if (letter !== "?") {
            if (letter === lastDetectedLetter) {
                stableFrames++;
            } else {
                stableFrames = 0;
                lastDetectedLetter = letter;
            }

            if (stableFrames >= REQUIRED_STABLE_FRAMES) {
                outputTextArea.value += letter;
                statusText.textContent = `Recognized: ${letter}`;
                stableFrames = 0; // Reset to prevent repeated additions
            } else {
                statusText.textContent = `Detecting: ${letter} (${stableFrames}/${REQUIRED_STABLE_FRAMES})`;
            }
        } else {
            statusText.textContent = "Show a clear ASL gesture";
            stableFrames = 0;
        }

        confidenceLevel.textContent = `Hand detected with landmarks`;
    } else {
        statusText.textContent = "No hand detected";
        stableFrames = 0;
    }

    canvasCtx.restore();
}

// Toggle landmarks visibility
function toggleLandmarks() {
    showLandmarks = !showLandmarks;
    const btn = document.getElementById("toggleLandmarksBtn");
    btn.textContent = showLandmarks ? "Hide Landmarks" : "Show Landmarks";
    btn.classList.toggle("btn--secondary", !showLandmarks);
    btn.classList.toggle("btn--info", showLandmarks);
}

// UI event listeners
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startButton").addEventListener("click", startCamera);
    document.getElementById("stopButton").addEventListener("click", stopCamera);
    document.getElementById("clearButton").addEventListener("click", () => {
        document.getElementById("outputText").value = "";
    });
    document.getElementById("copyButton").addEventListener("click", () => {
        const text = document.getElementById("outputText").value;
        navigator.clipboard.writeText(text).then(() => {
            statusText.textContent = "Text copied to clipboard!";
            setTimeout(() => {
                statusText.textContent = "Ready";
            }, 2000);
        });
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

    // Add toggle landmarks button listener
    document.getElementById("toggleLandmarksBtn").addEventListener("click", toggleLandmarks);
});
