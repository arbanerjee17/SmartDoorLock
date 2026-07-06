// ================================
// SMART DOOR LOCK - FACE-API VERSION
// ================================
// Required in index.html before this file:
// <script defer src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
// <script defer src="script.js"></script>
//
//============================
// Face Mode
//============================

const video = document.getElementById("video");

const registerBtn = document.getElementById("registerBtn");
const scanBtn = document.getElementById("scanBtn");
const lockBtn = document.getElementById("lockBtn");

const message = document.getElementById("message");
const subMessage = document.getElementById("subMessage");

const doorStatus = document.getElementById("doorStatus");
const countdown = document.getElementById("countdown");
const progressBar = document.getElementById("progressBar");
const lockIcon = document.getElementById("lockIcon");


//============================
// Mode Selection
//============================

const faceModeBtn = document.getElementById("faceModeBtn");
const rfidModeBtn = document.getElementById("rfidModeBtn");

const faceMode = document.getElementById("faceMode");
const rfidMode = document.getElementById("rfidMode");


//============================
// RFID Mode
//============================

const registerCardBtn = document.getElementById("registerCardBtn");
const scanCardBtn = document.getElementById("scanCardBtn");
const lockDoorBtn = document.getElementById("lockDoorBtn");

const rfidMessage = document.getElementById("rfidMessage");
const rfidSubMessage = document.getElementById("rfidSubMessage");

const rfidDoorStatus = document.getElementById("rfidDoorStatus");
const rfidCountdown = document.getElementById("rfidCountdown");
const rfidProgressBar = document.getElementById("rfidProgressBar");

const rfidIcon = document.getElementById("rfidIcon");

// CHANGE THIS TO YOUR ESP32 IP
const ESP32_IP = "192.168.31.77";

// Keep the models folder beside index.html.
const MODEL_URL = "./models";

// Lower = stricter. Try 0.45 to 0.6 depending on camera quality.
const MATCH_THRESHOLD = 0.45;
const AUTO_LOCK_SECONDS = 10;
const STORAGE_KEY = "smartDoorLock.registeredFaceDescriptor";
const PHOTO_STORAGE_KEY = "smartDoorLock.registeredFacePhoto";
const PHOTO_FEATURE_STORAGE_KEY = "smartDoorLock.registeredPhotoFeatures";
const FACE_SEARCH_TIMEOUT_MS = 10000;
//const PHOTO_MATCH_THRESHOLD = 0.62;
const DETECTOR_SETTINGS = [
    { inputSize: 608, scoreThreshold: 0.1 },
    { inputSize: 416, scoreThreshold: 0.12 },
    { inputSize: 320, scoreThreshold: 0.15 },
    { inputSize: 224, scoreThreshold: 0.2 }
];

let registeredDescriptor = null;
let registeredPhotoFeatures = null;
let modelsReady = false;
let unlocked = false;
let timer = null;

// ================================
// UI HELPERS
// ================================

function hasRegisteredIdentity() {
    return Boolean(registeredDescriptor || registeredPhotoFeatures);
}

function setMessage(mainText, secondaryText = "") {
    message.textContent = mainText;
    subMessage.textContent = secondaryText;
}

function setDoorLockedUi() {
    doorStatus.textContent = "LOCKED";
    doorStatus.style.color = "#ff3b30";
    countdown.textContent = "--";
    progressBar.style.width = "0%";

    if (lockIcon) {
        lockIcon.textContent = "LOCKED";
    }
}

function setDoorUnlockedUi(){

    doorStatus.textContent="UNLOCKED";
    doorStatus.style.color="#00ff88";

    rfidDoorStatus.textContent="UNLOCKED";
    rfidDoorStatus.style.color="#00ff88";

}

function setButtonsDisabled(disabled) {
    registerBtn.disabled = disabled;
    scanBtn.disabled = disabled;
    lockBtn.disabled = disabled;
}

// ================================
// CAMERA
// ================================

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
        },
        audio: false
    });

    video.srcObject = stream;

    await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
    });

    await video.play();
}

// ================================
// LOAD MODELS
// ================================

async function loadModels() {
    setMessage("LOADING AI...", "Please wait");

    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    console.log("MODELS LOADED");
    loadStoredFace();

    if (hasRegisteredIdentity()) {
        setMessage("SYSTEM READY", registeredDescriptor ? "Recognition mode loaded" : "Photo match mode loaded");
    } else {
        setMessage("SYSTEM READY", "Register your face");
    }
}

// ================================
// FACE RECOGNITION
// ================================

function getDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions(DETECTOR_SETTINGS[0]);
}

function captureFrameCanvas() {
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);

    return canvas;
}

function getLargestFace(results) {
    if (!results.length) {
        return null;
    }

    return results.reduce((largest, current) => {
        const largestBox = largest.detection.box;
        const currentBox = current.detection.box;
        const largestArea = largestBox.width * largestBox.height;
        const currentArea = currentBox.width * currentBox.height;

        return currentArea > largestArea ? current : largest;
    });
}

async function getFaceDescriptorFromFrame() {

    if (!modelsReady || video.readyState < 2) {
        return null;
    }

    const frame = captureFrameCanvas();

    for (const detectorSetting of DETECTOR_SETTINGS) {

        const options = new faceapi.TinyFaceDetectorOptions(detectorSetting);

        const results = await faceapi
            .detectAllFaces(frame, options)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const bestFace = getLargestFace(results);

        if (bestFace) {

            console.log("Face found:", {
                score: bestFace.detection.score,
                box: bestFace.detection.box,
                detectorSetting
            });

            return bestFace.descriptor;
        }
    }

    return null;
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function waitForFaceDescriptor(timeoutMs = FACE_SEARCH_TIMEOUT_MS) {
    if (!modelsReady) {
        return null;
    }

    const startedAt = Date.now();
    let attempts = 0;

    while (Date.now() - startedAt < timeoutMs) {
        attempts += 1;
        subMessage.textContent = `Looking for face... ${attempts}`;

        const descriptor = await getFaceDescriptorFromFrame();

        if (descriptor) {

          console.log("Descriptor Captured");

         return descriptor;
        }

        await sleep(250);
    }

    return null;
}

function captureCurrentPhoto() {
    return captureFrameCanvas().toDataURL("image/jpeg", 0.85);
}

function getFrameFeatures() {
    const source = captureFrameCanvas();
    const size = 32;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = size;
    canvas.height = size;

    const cropSize = Math.min(source.width, source.height) * 0.78;
    const cropX = (source.width - cropSize) / 2;
    const cropY = (source.height - cropSize) / 2;

    context.drawImage(source, cropX, cropY, cropSize, cropSize, 0, 0, size, size);

    const pixels = context.getImageData(0, 0, size, size).data;
    const grayscale = [];
    const histogram = new Array(16).fill(0);

    for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const value = (red * 0.299) + (green * 0.587) + (blue * 0.114);

        grayscale.push(value);
        histogram[Math.min(15, Math.floor(value / 16))] += 1;
    }

    const mean = grayscale.reduce((sum, value) => sum + value, 0) / grayscale.length;
    const normalized = grayscale.map((value) => value - mean);
    const histogramTotal = histogram.reduce((sum, value) => sum + value, 0);

    return {
        normalized,
        histogram: histogram.map((value) => value / histogramTotal)
    };
}

function comparePhotoFeatures(first, second) {
    if (!first || !second) {
        return 0;
    }

    let dot = 0;
    let firstMagnitude = 0;
    let secondMagnitude = 0;

    for (let index = 0; index < first.normalized.length; index += 1) {
        dot += first.normalized[index] * second.normalized[index];
        firstMagnitude += first.normalized[index] * first.normalized[index];
        secondMagnitude += second.normalized[index] * second.normalized[index];
    }

    const textureScore = dot / (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude) || 1);
    const histogramScore = first.histogram.reduce((sum, value, index) => {
        return sum + Math.min(value, second.histogram[index]);
    }, 0);

    return ((textureScore + 1) / 2 * 0.65) + (histogramScore * 0.35);
}

function saveRegisteredFace(descriptor = null) {
    const photo = captureCurrentPhoto();
    registeredPhotoFeatures = getFrameFeatures();

    localStorage.setItem(PHOTO_STORAGE_KEY, photo);
    localStorage.setItem(PHOTO_FEATURE_STORAGE_KEY, JSON.stringify(registeredPhotoFeatures));

    if (descriptor) {
        const descriptorArray = Array.from(descriptor);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(descriptorArray));
        registeredDescriptor = new Float32Array(descriptorArray);
    } else {
        localStorage.removeItem(STORAGE_KEY);
        registeredDescriptor = null;
    }
}

function loadStoredFace() {
    const storedFace = localStorage.getItem(STORAGE_KEY);
    const storedPhotoFeatures = localStorage.getItem(PHOTO_FEATURE_STORAGE_KEY);

    if (storedPhotoFeatures) {
        try {
            registeredPhotoFeatures = JSON.parse(storedPhotoFeatures);
        } catch (error) {
            localStorage.removeItem(PHOTO_FEATURE_STORAGE_KEY);
            registeredPhotoFeatures = null;
        }
    }

    if (!storedFace) {
        registeredDescriptor = null;
        return;
    }

    try {
        registeredDescriptor = new Float32Array(JSON.parse(storedFace));
    } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        registeredDescriptor = null;
    }
}

function isRegisteredFace(scanDescriptor) {

    if (!registeredDescriptor) {
        return false;
    }

    const distance = faceapi.euclideanDistance(
        registeredDescriptor,
        scanDescriptor
    );

    console.log("Face distance:", distance);

    return distance <= MATCH_THRESHOLD;
}
// ================================
// REGISTER FACE
// ================================

registerBtn.addEventListener("click", async () => {

    setButtonsDisabled(true);
    setMessage("CAPTURING PHOTO...", "Look at camera");

    try {

        const descriptor = await waitForFaceDescriptor();

        saveRegisteredFace(descriptor);

        if (descriptor) {

            setMessage("FACE REGISTERED", "Recognition mode ready");

        } else {

            setMessage("PHOTO REGISTERED", "Photo match mode ready");

        }

    } catch (error) {

        console.error(error);
        setMessage("REGISTER FAILED", "Try again");

    } finally {

        setButtonsDisabled(false);

    }

});





// ================================
// LOCK BUTTON
// ================================

lockBtn.addEventListener("click", async () => {
    await lockDoor();
});

registerCardBtn.onclick = async () => {

    rfidMessage.textContent = "REGISTERING...";
    rfidSubMessage.textContent = "Tap RFID Card";

    try{

        const res = await fetch(`http://${ESP32_IP}/registerCard`);
        const txt = await res.text();

        console.log(txt);

        if(txt.trim()=="CARD_REGISTERED"){

            rfidMessage.textContent="CARD REGISTERED";
            rfidSubMessage.textContent="Ready to Scan";

        }else{

            rfidMessage.textContent="REGISTER FAILED";
            rfidSubMessage.textContent=txt;

        }

    }catch(err){

        console.log(err);

        rfidMessage.textContent="ESP32 OFFLINE";

    }

}
scanBtn.addEventListener("click", async () => {

    if (!registeredDescriptor) {

        setMessage("REGISTER FACE FIRST", "No face enrolled");
        return;

    }

    setButtonsDisabled(true);
    setMessage("SCANNING...", "Look at camera");

    try {

        const descriptor = await waitForFaceDescriptor();

        if (!descriptor) {

            await denyAccess();

        } else if (isRegisteredFace(descriptor)) {

            await unlockDoor();

        } else {

            await denyAccess();

        }

    } catch (err) {

        console.error(err);
        setMessage("SCAN FAILED", "Try again");

    } finally {

        setButtonsDisabled(false);

    }

});
lockDoorBtn.onclick=()=>{

    lockDoor();

}

faceModeBtn.addEventListener("click",showFaceMode);

rfidModeBtn.addEventListener("click",showRFIDMode);


// ================================
// ESP32
// ================================

async function sendEsp32Command(command) {
    try {
        await fetch(`http://${ESP32_IP}/${command}`, {
            method: "GET",
            mode: "no-cors"
        });
    } catch (error) {
        console.log("ESP32 offline or blocked:", error);
    }
}


// ================================
// ACCESS CONTROL
// ================================

async function unlockDoor() {
    if (unlocked) {
        startCountdown();
        return;
    }

    unlocked = true;
    setDoorUnlockedUi();
    setMessage("ACCESS GRANTED", "Door open");

    await sendEsp32Command("unlock");
    startCountdown();
}

async function lockDoor() {
    unlocked = false;
    clearInterval(timer);
    timer = null;

    setDoorLockedUi();
    setMessage("SYSTEM READY", hasRegisteredIdentity() ? "Saved identity loaded" : "Register your face");

    await sendEsp32Command("lock");
}

async function denyAccess() {
    setMessage("ACCESS DENIED", "Unknown face");
    await sendEsp32Command("lock");
    setDoorLockedUi();
}

// ================================
// COUNTDOWN
// ================================

function startCountdown() {

    let secondsLeft = AUTO_LOCK_SECONDS;

    clearInterval(timer);

    countdown.textContent = secondsLeft;
    rfidCountdown.textContent = secondsLeft;

    progressBar.style.width = "100%";
    rfidProgressBar.style.width = "100%";

    timer = setInterval(async () => {

        secondsLeft--;

        countdown.textContent = secondsLeft;
        rfidCountdown.textContent = secondsLeft;

        const progress = (secondsLeft / AUTO_LOCK_SECONDS) * 100;

        if (faceMode.style.display !== "none") {

            progressBar.style.width = progress + "%";

        } else {

            rfidProgressBar.style.width = progress + "%";

        }

        if (secondsLeft <= 0) {

            clearInterval(timer);
            timer = null;

            progressBar.style.width = "0%";
            rfidProgressBar.style.width = "0%";

            await lockDoor();

        }

    }, 1000);

}

// ================================
// START
// ================================

function showFaceMode(){

    faceMode.style.display="block";
    rfidMode.style.display="none";

    faceModeBtn.classList.add("active");
    rfidModeBtn.classList.remove("active");

    

}

function showRFIDMode(){

    faceMode.style.display="none";
    rfidMode.style.display="block";

    rfidModeBtn.classList.add("active");
    faceModeBtn.classList.remove("active");

    stopCamera();

}
function stopCamera(){

    if(video.srcObject){

        video.srcObject.getTracks().forEach(track=>track.stop());

        video.srcObject=null;

    }

}
async function init() {
    setButtonsDisabled(true);
    setDoorLockedUi();
    showFaceMode();

    try {
        await startCamera();
        await loadModels();
    } catch (error) {
        console.error(error);
        setMessage("SYSTEM ERROR", "Camera or AI failed");
    } finally {
        setButtonsDisabled(false);
    }
}
// HTML IS A STUPID LANGUAGE SO I HAVE TO CALL INIT() TWICE TO MAKE IT WORK 
init();
//CHATGPT IS A STUPID AI SO I DUMPED ALL THE CODE IN ONE FILE AND MADE IT WORK
//CSS IS A STUPID LANGUAGE SO I DUMPED ALL THE CODE IN ONE FILE AND MADE IT WORK
