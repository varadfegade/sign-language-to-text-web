// Sign Language Converter - Main Application
class SignLanguageConverter {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.video = null;
        this.canvas = null;
        this.canvasCtx = null;
        this.isRecognizing = false;
        this.showLandmarks = true;
        this.lastGesture = '';
        this.gestureHoldTime = 0;
        this.requiredHoldTime = 20; // frames to hold gesture before adding to text
        this.isInitialized = false;
        this.animationId = null;

        this.initializeElements();
        this.initializeEventListeners();
        this.initializeApplication();
    }

    initializeElements() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.textOutput = document.getElementById('textOutput');
        this.currentGesture = document.getElementById('currentGesture');
        this.confidence = document.getElementById('confidence');
        this.confidenceBar = document.getElementById('confidenceBar');
        this.recognitionStatus = document.getElementById('recognitionStatus');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');

        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.errorClose = document.getElementById('errorClose');
        this.showLandmarksCheckbox = document.getElementById('showLandmarks');
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.startRecognition();
        });

        this.stopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.stopRecognition();
        });

        this.clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.clearText();
        });

        this.copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyText();
        });

        this.downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadText();
        });

        this.errorClose.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideError();
        });

        this.showLandmarksCheckbox.addEventListener('change', (e) => {
            this.showLandmarks = e.target.checked;
        });
    }

    async initializeApplication() {
        try {
            this.updateStatus('Initializing camera...', 'loading');
            await this.initializeCamera();

            this.updateStatus('Loading AI model...', 'loading');
            await this.initializeMediaPipe();

            this.isInitialized = true;
            this.startBtn.disabled = false;
            this.loading.classList.add('hidden');
            this.updateStatus('Ready to start recognition', 'ready');

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize camera or AI model. Please check your camera permissions and try again.');
            this.updateStatus('Initialization failed', 'error');
        }
    }

    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            this.video.srcObject = stream;

            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('Camera access denied or unavailable');
        }
    }

    async initializeMediaPipe() {
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => {
                this.processResults(results);
            });

            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    if (this.isRecognizing) {
                        await this.hands.send({image: this.video});
                    }
                },
                width: 640,
                height: 480
            });

        } catch (error) {
            throw new Error('Failed to load MediaPipe model');
        }
    }

    processResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw video frame
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Draw hand landmarks if enabled
            if (this.showLandmarks) {
                this.drawLandmarks(landmarks);
            }

            // Recognize gesture
            const gesture = this.recognizeGesture(landmarks);
            this.updateGestureDisplay(gesture);

        } else {
            // No hand detected
            this.updateGestureDisplay({ letter: '-', confidence: 0 });
        }

        this.canvasCtx.restore();
    }

    drawLandmarks(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // index
            [0, 9], [9, 10], [10, 11], [11, 12], // middle
            [0, 13], [13, 14], [14, 15], [15, 16], // ring
            [0, 17], [17, 18], [18, 19], [19, 20], // pinky
            [5, 9], [9, 13], [13, 17] // palm connections
        ];

        this.canvasCtx.strokeStyle = '#00ff00';
        this.canvasCtx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(startPoint.x * this.canvas.width, startPoint.y * this.canvas.height);
            this.canvasCtx.lineTo(endPoint.x * this.canvas.width, endPoint.y * this.canvas.height);
            this.canvasCtx.stroke();
        });

        // Draw landmark points
        this.canvasCtx.fillStyle = '#ff0000';
        landmarks.forEach((landmark, index) => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvas.width,
                landmark.y * this.canvas.height,
                index === 0 ? 8 : 5, // wrist point larger
                0, 2 * Math.PI
            );
            this.canvasCtx.fill();
        });
    }

    recognizeGesture(landmarks) {
        try {
            // Simple gesture recognition based on finger positions
            const fingers = this.getFingerPositions(landmarks);
            const gesture = this.classifyGesture(fingers, landmarks);
            return gesture;
        } catch (error) {
            console.error('Gesture recognition error:', error);
            return { letter: '-', confidence: 0 };
        }
    }

    getFingerPositions(landmarks) {
        // Get finger tip and joint positions
        const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
        const fingerJoints = [3, 6, 10, 14, 18];

        const fingers = [];

        for (let i = 0; i < 5; i++) {
            const tip = landmarks[fingerTips[i]];
            const joint = landmarks[fingerJoints[i]];

            // Check if finger is extended (tip higher than joint for most fingers)
            let isExtended;
            if (i === 0) { // thumb
                isExtended = tip.x > joint.x; // thumb extends horizontally
            } else {
                isExtended = tip.y < joint.y; // other fingers extend upward
            }

            fingers.push({
                tip: tip,
                joint: joint,
                isExtended: isExtended,
                angle: this.calculateAngle(joint, tip)
            });
        }

        return fingers;
    }

    calculateAngle(point1, point2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
    }

    classifyGesture(fingers, landmarks) {
        const extendedFingers = fingers.map(f => f.isExtended);
        const confidence = this.calculateConfidence(fingers, landmarks);

        // Simple gesture classification based on extended fingers
        const pattern = extendedFingers.join('');

        switch (pattern) {
            case 'false,true,false,false,false': // Index finger only
                return { letter: 'D', confidence: confidence };
            case 'false,true,true,false,false': // Index and middle
                return this.distinguishUV(fingers, confidence);
            case 'false,true,true,true,false': // Index, middle, ring
                return { letter: 'W', confidence: confidence };
            case 'true,false,false,false,false': // Thumb only
                return { letter: 'A', confidence: confidence * 0.7 }; // Lower confidence for A
            case 'true,true,false,false,false': // Thumb and index
                return { letter: 'L', confidence: confidence };
            case 'false,false,false,false,true': // Pinky only
                return { letter: 'I', confidence: confidence };
            case 'true,false,false,false,true': // Thumb and pinky
                return { letter: 'Y', confidence: confidence };
            case 'false,false,false,false,false': // Closed fist
                return this.distinguishClosedFist(fingers, landmarks, confidence);
            case 'false,true,true,true,true': // Four fingers extended
                return { letter: 'B', confidence: confidence * 0.8 };
            case 'true,true,true,true,true': // All fingers extended
                return { letter: 'G', confidence: confidence * 0.6 };
            default:
                return this.detectSpecialGestures(fingers, landmarks, confidence);
        }
    }

    distinguishUV(fingers, confidence) {
        // Check angle between index and middle finger
        const indexTip = fingers[1].tip;
        const middleTip = fingers[2].tip;
        const separation = Math.abs(indexTip.x - middleTip.x);

        if (separation > 0.05) { // Fingers spread apart
            return { letter: 'V', confidence: confidence };
        } else { // Fingers close together
            return { letter: 'U', confidence: confidence };
        }
    }

    distinguishClosedFist(fingers, landmarks, confidence) {
        // Check thumb position relative to fingers
        const thumb = landmarks[4];
        const indexBase = landmarks[5];

        if (thumb.x < indexBase.x - 0.05) { // Thumb tucked in
            return { letter: 'A', confidence: confidence };
        } else { // Thumb across palm
            return { letter: 'E', confidence: confidence * 0.8 };
        }
    }

    detectSpecialGestures(fingers, landmarks, confidence) {
        // Detect O gesture (all fingertips close to thumb)
        const thumb = landmarks[4];
        const fingertips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

        let totalDistance = 0;
        fingertips.forEach(tip => {
            totalDistance += Math.sqrt(
                Math.pow(tip.x - thumb.x, 2) + Math.pow(tip.y - thumb.y, 2)
            );
        });

        if (totalDistance < 0.3) { // All fingertips close to thumb
            return { letter: 'O', confidence: confidence };
        }

        // Detect C gesture (curved hand)
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const pinkyTip = landmarks[20];

        const curvature = this.calculateCurvature([wrist, indexTip, pinkyTip]);
        if (curvature > 0.5 && !fingers[1].isExtended && !fingers[4].isExtended) {
            return { letter: 'C', confidence: confidence * 0.7 };
        }

        return { letter: '-', confidence: 0 };
    }

    calculateCurvature(points) {
        // Simple curvature calculation
        if (points.length < 3) return 0;

        const [p1, p2, p3] = points;
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);

        return Math.abs(angle2 - angle1);
    }

    calculateConfidence(fingers, landmarks) {
        // Simple confidence calculation based on hand stability and clarity
        let confidence = 0.5; // Base confidence

        // Check if hand is stable (not moving too much)
        confidence += 0.2;

        // Check if landmarks are well-defined
        const landmarkVariance = this.calculateLandmarkVariance(landmarks);
        if (landmarkVariance < 0.01) {
            confidence += 0.3;
        }

        return Math.min(confidence, 1.0);
    }

    calculateLandmarkVariance(landmarks) {
        // Calculate variance in landmark positions (simplified)
        let variance = 0;
        for (let i = 1; i < landmarks.length; i++) {
            const prev = landmarks[i - 1];
            const curr = landmarks[i];
            variance += Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );
        }
        return variance / landmarks.length;
    }

    updateGestureDisplay(gesture) {
        const { letter, confidence } = gesture;

        // Update current gesture display
        this.currentGesture.textContent = letter;
        this.confidence.textContent = `${Math.round(confidence * 100)}%`;
        this.confidenceBar.style.width = `${confidence * 100}%`;

        // Add to text if gesture is held consistently
        if (letter !== '-' && letter === this.lastGesture && confidence > 0.6) {
            this.gestureHoldTime++;

            if (this.gestureHoldTime >= this.requiredHoldTime) {
                this.addLetterToText(letter);
                this.gestureHoldTime = 0;
                this.lastGesture = '';

                // Visual feedback
                this.currentGesture.classList.add('detected');
                setTimeout(() => {
                    this.currentGesture.classList.remove('detected');
                }, 600);
            }
        } else {
            this.gestureHoldTime = 0;
            this.lastGesture = letter;
        }
    }

    addLetterToText(letter) {
        const currentText = this.textOutput.textContent;
        if (currentText === 'Start making ASL gestures to see text appear here...') {
            this.textOutput.textContent = letter;
        } else {
            this.textOutput.textContent += letter;
        }

        // Auto-scroll to bottom
        this.textOutput.scrollTop = this.textOutput.scrollHeight;
    }

    async startRecognition() {
        if (!this.isInitialized) {
            this.showError('Application not initialized. Please wait for initialization to complete.');
            return;
        }

        try {
            this.isRecognizing = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;

            await this.camera.start();

            this.updateStatus('Recognition active - make ASL gestures!', 'active');

        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.showError('Failed to start recognition. Please check your camera.');
            this.isRecognizing = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
    }

    stopRecognition() {
        this.isRecognizing = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;

        if (this.camera) {
            this.camera.stop();
        }

        this.updateStatus('Recognition stopped', 'ready');

        // Clear gesture display
        this.currentGesture.textContent = '-';
        this.confidence.textContent = '0%';
        this.confidenceBar.style.width = '0%';
    }

    clearText() {
        this.textOutput.textContent = 'Start making ASL gestures to see text appear here...';
    }

    async copyText() {
        try {
            const text = this.textOutput.textContent;
            if (text === 'Start making ASL gestures to see text appear here...') {
                this.showError('No text to copy.');
                return;
            }

            await navigator.clipboard.writeText(text);
            this.showSuccess('Text copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy text:', error);
            this.showError('Failed to copy text to clipboard.');
        }
    }

    downloadText() {
        const text = this.textOutput.textContent;
        if (text === 'Start making ASL gestures to see text appear here...') {
            this.showError('No text to download.');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sign-language-text-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Text downloaded successfully!');
    }

    updateStatus(message, type = 'ready') {
        this.recognitionStatus.textContent = message;
        this.recognitionStatus.className = `status ${type}`;
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showSuccess(message) {
        // Simple success notification (you can enhance this)
        const originalStatus = this.recognitionStatus.textContent;
        this.updateStatus(message, 'active');
        setTimeout(() => {
            this.updateStatus(originalStatus, 'ready');
        }, 3000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check for required browser features
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
                <div>
                    <h1>⚠️ Browser Not Supported</h1>
                    <p>This application requires a modern browser with webcam support.</p>
                    <p>Please use Chrome, Firefox, Safari, or Edge.</p>
                </div>
            </div>
        `;
        return;
    }

    // Initialize the application
    try {
        window.signLanguageConverter = new SignLanguageConverter();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
                <div>
                    <h1>❌ Initialization Error</h1>
                    <p>Failed to initialize the application.</p>
                    <p>Please refresh the page and try again.</p>
                </div>
            </div>
        `;
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.signLanguageConverter) {
        if (document.hidden && window.signLanguageConverter.isRecognizing) {
            window.signLanguageConverter.stopRecognition();
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.signLanguageConverter && window.signLanguageConverter.isRecognizing) {
        window.signLanguageConverter.stopRecognition();
    }
});