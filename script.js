// ================================
// SMART DOOR LOCK - SIMPLE VERSION
// ================================

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

// ================================
// RFID
// ================================

const faceModeBtn = document.getElementById("faceModeBtn");
const rfidModeBtn = document.getElementById("rfidModeBtn");

const faceMode = document.getElementById("faceMode");
const rfidMode = document.getElementById("rfidMode");

const registerCardBtn = document.getElementById("registerCardBtn");
const scanCardBtn = document.getElementById("scanCardBtn");
const lockDoorBtn = document.getElementById("lockDoorBtn");

const rfidMessage = document.getElementById("rfidMessage");
const rfidSubMessage = document.getElementById("rfidSubMessage");

const rfidDoorStatus = document.getElementById("rfidDoorStatus");
const rfidCountdown = document.getElementById("rfidCountdown");
const rfidProgressBar = document.getElementById("rfidProgressBar");
const rfidIcon = document.getElementById("rfidIcon");

let rfidUnlocked = false;
let rfidTimer = null;

const pinModeBtn=document.getElementById("pinModeBtn");

const pinMode=document.getElementById("pinMode");

const pinInput=document.getElementById("pinInput");

const unlockPinBtn=document.getElementById("unlockPinBtn");
const lockPinBtn = document.getElementById("lockPinBtn");

let pinUnlocked=false;

let pinTimer=null;


const pinMessage=document.getElementById("pinMessage");

const pinSubMessage=document.getElementById("pinSubMessage");

const pinCountdown=document.getElementById("pinCountdown");

const pinProgressBar=document.getElementById("pinProgressBar");
const MASTER_PIN="123456";
const keySound = new Audio("icons/key.mp3");
keySound.volume = 0.5;

// CHANGE THIS TO YOUR ESP32 IP
const ESP32_IP = "192.168.31.77";

let model;
let faceDetected = false;
let faceRegistered = false;
let unlocked = false;
let timer;

// ================================
// CAMERA
// ================================

async function startCamera() {

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });

    video.srcObject = stream;

}

// ================================
// LOAD MODEL
// ================================

async function loadModel() {

    message.innerHTML = "Loading AI...";

    model = await blazeface.load();

    message.innerHTML = "SYSTEM READY";
    subMessage.innerHTML = "Door Locked";

}

// ================================
// FACE DETECTION
// ================================

async function detectFace() {

    if (!model) {
        requestAnimationFrame(detectFace);
        return;
    }

    try {

        const predictions = await model.estimateFaces(video, false);

        faceDetected = predictions.length > 0;

    } catch (e) {}

    requestAnimationFrame(detectFace);

}

// ================================
// REGISTER FACE
// ================================

registerBtn.addEventListener("click", () => {

    if (!faceDetected) {

        message.innerHTML = "NO FACE FOUND";
        subMessage.innerHTML = "Look at Camera";

        return;
    }

    faceRegistered = true;

    message.innerHTML = "FACE REGISTERED ✓";
    subMessage.innerHTML = "Ready To Scan";

});

// ================================
// SCAN FACE
// ================================

scanBtn.addEventListener("click", async () => {

    if (!faceRegistered) {

        message.innerHTML = "REGISTER FIRST";
        subMessage.innerHTML = "";

        return;
    }

    if (!faceDetected) {

        message.innerHTML = "NO FACE FOUND";
        subMessage.innerHTML = "Look at Camera";

        return;
    }

    await unlockDoor();

});

// ================================
// LOCK BUTTON
// ================================

lockBtn.addEventListener("click", async () => {

    await lockDoor();

});

// ================================
// UNLOCK
// ================================

async function unlockDoor() {

    if (unlocked) return;

    unlocked = true;

    doorStatus.innerHTML = "UNLOCKED";
    doorStatus.style.color = "#00ff88";

    message.innerHTML = "ACCESS GRANTED";
    subMessage.innerHTML = "Door Open";

    try {

        await fetch(`http://${ESP32_IP}/unlock`);

    } catch (e) {

        console.log("ESP32 OFFLINE");

    }

    startCountdown();

}

// ================================
// LOCK
// ================================

async function lockDoor() {

    unlocked = false;

    clearInterval(timer);

    countdown.innerHTML = "--";
    progressBar.style.width = "0%";

    doorStatus.innerHTML = "LOCKED";
    doorStatus.style.color = "#ff3b30";

    message.innerHTML = "SYSTEM READY";
    subMessage.innerHTML = "Door Locked";

    try {

        await fetch(`http://${ESP32_IP}/lock`);

    } catch (e) {

        console.log("ESP32 OFFLINE");

    }

}

// ================================
// COUNTDOWN
// ================================

function startCountdown() {

    let sec = 10;

    countdown.innerHTML = sec;
    progressBar.style.width = "100%";

    clearInterval(timer);

    timer = setInterval(() => {

        sec--;

        countdown.innerHTML = sec;

        progressBar.style.width = (sec * 10) + "%";

        if (sec <= 0) {

            clearInterval(timer);

            lockDoor();

        }

    }, 1000);

}

// ================================
// START
// ================================

async function init() {

    await startCamera();

    await loadModel();

    detectFace();

}

init();

faceModeBtn.onclick = () => {

    faceMode.style.display = "block";
    rfidMode.style.display = "none";

    faceModeBtn.classList.add("activeMode");
    rfidModeBtn.classList.remove("activeMode");

};

rfidModeBtn.onclick = () => {

    faceMode.style.display = "none";
    rfidMode.style.display = "block";

    rfidModeBtn.classList.add("activeMode");
    faceModeBtn.classList.remove("activeMode");

};
registerCardBtn.onclick = async () => {

    rfidMessage.innerHTML = "TAP CARD...";
    rfidSubMessage.innerHTML = "Waiting...";

    try{

        const response = await fetch(`http://${ESP32_IP}/registerCard`);
        const result = await response.text();

        if(result==="CARD_REGISTERED"){

            rfidMessage.innerHTML="CARD REGISTERED";
            rfidSubMessage.innerHTML="Ready To Scan";

        }
        else{

            rfidMessage.innerHTML="REGISTER FAILED";
            rfidSubMessage.innerHTML="Try Again";

        }

    }
    catch{

        rfidMessage.innerHTML="ESP32 OFFLINE";

    }

};
scanCardBtn.onclick = async () => {

    rfidMessage.innerHTML="SCAN CARD";
    rfidSubMessage.innerHTML="Tap Card";

    try{

        const response=await fetch(`http://${ESP32_IP}/scanCard`);
        const result=await response.text();

        if(result==="ACCESS_GRANTED"){

            await unlockRFIDDoor();

        }
        else{

            rfidDoorStatus.innerHTML="LOCKED";
            rfidDoorStatus.style.color="#ff3b30";

            rfidMessage.innerHTML="ACCESS DENIED";
            rfidSubMessage.innerHTML="Invalid Card";

        }

    }
    catch{

        rfidMessage.innerHTML="ESP32 OFFLINE";

    }

};

lockDoorBtn.onclick = async()=>{

    await lockRFIDDoor();

};

async function unlockRFIDDoor(){

    if(rfidUnlocked) return;

    rfidUnlocked=true;

    rfidDoorStatus.innerHTML="UNLOCKED";
    rfidDoorStatus.style.color="#00ff88";

    rfidMessage.innerHTML="ACCESS GRANTED";
    rfidSubMessage.innerHTML="Door Open";

    startRFIDCountdown();

}

async function lockRFIDDoor(){

    rfidUnlocked=false;

    clearInterval(rfidTimer);

    rfidCountdown.innerHTML="--";
    rfidProgressBar.style.width="0%";

    rfidDoorStatus.innerHTML="LOCKED";
    rfidDoorStatus.style.color="#ff3b30";

    rfidMessage.innerHTML="SYSTEM READY";
    rfidSubMessage.innerHTML="Tap RFID Card";

    try{

        await fetch(`http://${ESP32_IP}/lock`);

    }
    catch{}

}

function startRFIDCountdown(){

    let sec=10;

    clearInterval(rfidTimer);

    rfidCountdown.innerHTML=sec;
    rfidProgressBar.style.width="100%";

    rfidTimer=setInterval(()=>{

        sec--;

        rfidCountdown.innerHTML=sec;
        rfidProgressBar.style.width=(sec*10)+"%";

        if(sec<=0){

            clearInterval(rfidTimer);
            lockRFIDDoor();

        }

    },1000);

}

pinModeBtn.onclick=()=>{

faceMode.style.display="none";
rfidMode.style.display="none";
pinMode.style.display="block";

faceModeBtn.classList.remove("activeMode");
rfidModeBtn.classList.remove("activeMode");
pinModeBtn.classList.add("activeMode");

};

document.querySelectorAll(".pinKey").forEach(button=>{

    button.addEventListener("click",()=>{

        keySound.pause();
        keySound.currentTime=0;
        keySound.play().catch(()=>{});

        if(pinInput.value.length<6){

            pinInput.value+=button.innerHTML;

        }

    });

});

pinClear.onclick=()=>{

    keySound.pause();
    keySound.currentTime=0;
    keySound.play().catch(()=>{});

    pinInput.value="";

};

pinBack.onclick=()=>{

    keySound.pause();
    keySound.currentTime=0;
    keySound.play().catch(()=>{});

    pinInput.value=pinInput.value.slice(0,-1);

};

document.addEventListener("keydown",(event)=>{

if(pinMode.style.display==="none") return;

if(event.key>="0" && event.key<="9"){

if(pinInput.value.length<6){

pinInput.value+=event.key;

}

}

if(event.key==="Backspace"){

pinInput.value=pinInput.value.slice(0,-1);

}

if(event.key==="Enter"){

unlockPinBtn.click();

}

});

unlockPinBtn.onclick=async()=>{

    if(pinInput.value.length!==6){

        pinMessage.innerHTML="ENTER 6 DIGITS";
        return;

    }

    if(pinInput.value!==MASTER_PIN){

        pinMessage.innerHTML="WRONG PIN";
        pinSubMessage.innerHTML="Access Denied";
        pinInput.value="";
        return;

    }

    pinInput.value="";

    await unlockPinDoor();

};

lockPinBtn.onclick = async () => {

    await lockPinDoor();

};

async function unlockPinDoor(){

    if(pinUnlocked) return;

    pinUnlocked=true;

    doorStatus.innerHTML="UNLOCKED";
    doorStatus.style.color="#00ff88";

    pinMessage.innerHTML="ACCESS GRANTED";
    pinSubMessage.innerHTML="Door Open";

    try{

        await fetch(`http://${ESP32_IP}/unlock`);

    }catch{}

    startPinCountdown();

}

async function lockPinDoor(){

    pinUnlocked = false;

    clearInterval(pinTimer);

    pinCountdown.innerHTML = "--";
    pinProgressBar.style.width = "0%";

    doorStatus.innerHTML = "LOCKED";
    doorStatus.style.color = "#ff3b30";

    pinMessage.innerHTML = "SYSTEM READY";
    pinSubMessage.innerHTML = "Door Locked";

    pinInput.value = "";

    try{

        await fetch(`http://${ESP32_IP}/lock`);

    }catch(e){

        console.log("ESP32 OFFLINE");

    }

}

function startPinCountdown(){

    let sec=10;

    clearInterval(pinTimer);

    pinCountdown.innerHTML=sec;

    pinProgressBar.style.width="100%";

    pinTimer=setInterval(()=>{

        sec--;

        pinCountdown.innerHTML=sec;

        pinProgressBar.style.width=(sec*10)+"%";

        if(sec<=0){

            clearInterval(pinTimer);

            lockPinDoor();

        }

    },1000);

}
