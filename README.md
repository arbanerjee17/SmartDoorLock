# 🔐 Smart Door Lock System

A modern AI-powered Smart Door Lock System built using **ESP32-C6**, **Face Recognition**, **RFID Authentication**, and **PIN-based Access Control**. The system provides multiple secure authentication methods through a responsive web interface while communicating wirelessly with the ESP32 over Wi-Fi.

---

## 📌 Features

### 👤 AI Face Recognition
- Register a user's face
- Scan face for authentication
- Real-time camera preview
- Automatic door unlock on successful verification
- Manual lock button
- Auto-lock timer with countdown and progress bar

---

### 📡 RFID Authentication
- Register RFID cards (EM18 Reader)
- Scan registered RFID cards
- Access Granted / Access Denied notifications
- Manual lock button
- Auto-lock countdown
- Animated RFID interface

---

### 🔢 6-Digit PIN Authentication
- Secure six-digit PIN unlock
- On-screen numeric keypad
- Keyboard support
- Manual lock button
- Auto-lock countdown
- Progress bar
- Mobile-style keypad sounds

---

### 🌐 Web Dashboard
- Responsive UI for Desktop, Tablet and Mobile
- Authentication Mode Selection
- Face Recognition Mode
- RFID Mode
- PIN Unlock Mode
- Real-time door status
- Clean futuristic interface

---

## 🛠 Hardware Used

- ESP32-C6
- EM18 RFID Reader
- SG90 Servo Motor
- Red LED
- Green LED
- Push Buttons
- Breadboard
- Jumper Wires
- USB Cable

---

## 💻 Software & Technologies

- HTML5
- CSS3
- JavaScript
- ESP32 Arduino Framework
- WiFi Library
- WebServer Library
- ESP32Servo Library
- BlazeFace AI Model
- TensorFlow.js

---

## 📂 Project Structure

```
SmartDoorLock/
│
├── index.html
├── style.css
├── script.js
│
├── icons/
│   ├── lock.png
│   ├── unlock.png
│   ├── rfid-card.jpg
│   ├── ...
│
├── sounds/
│   └── keypad.mp3
│
├── models/
│   ├── tiny_face_detector
│   ├── face_landmark_68
│   └── face_recognition
│
└── ESP32_Code/
    └── SmartDoorLock.ino
```

---

## 🚀 How It Works

### Face Recognition

1. Select **Face Recognition Mode**
2. Register your face
3. Scan your face
4. If verified:
   - Door Unlocks
   - Green Status
   - Auto-lock countdown starts

---

### RFID

1. Select **RFID Mode**
2. Register RFID Card
3. Scan Registered Card
4. If verified:
   - Door Unlocks
   - Countdown starts
5. Unknown cards are denied.

---

### PIN Unlock

1. Select **PIN Mode**
2. Enter the 6-digit PIN
3. Press Unlock
4. Door unlocks
5. Auto-lock activates after the countdown.

---

## 🔒 Security Features

- Face Registration
- RFID Card Registration
- PIN Authentication
- Manual Lock
- Auto Lock
- Wi-Fi Communication
- Multiple Authentication Modes

---

## 📱 Responsive Design

The interface automatically adapts to:

- Desktop
- Laptop
- Tablet
- Android
- iPhone

---

## ⚙ ESP32 API Endpoints

| Endpoint | Function |
|-----------|----------|
| `/unlock` | Unlock Door |
| `/lock` | Lock Door |
| `/status` | Door Status |
| `/registerCard` | Register RFID Card |
| `/scanCard` | Scan RFID Card |
| `/clearCard` | Clear Registered Card |

---

## 📷 Preview

- AI Face Recognition
- RFID Authentication
- PIN Unlock
- Responsive Dashboard
- Servo-based Door Lock
- Auto Lock Countdown

*(Add screenshots here if available.)*

---

## 🔮 Future Enhancements

- Cloud Database Integration
- Face Anti-Spoofing
- Multiple User Profiles
- Mobile Application
- OTP Authentication
- Voice Unlock
- Fingerprint Authentication
- Event Logs
- Push Notifications
- AES Encrypted Communication

---

## 👨‍💻 Author

**Aparup Banerjee**  
Associate, IIMCIP-TIC

---

## 📄 License

This project is intended for educational, research and prototype purposes.

© 2026 Aparup Banerjee. All Rights Reserved.
