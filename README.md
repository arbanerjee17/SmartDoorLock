# SmartDoorLock# 🔐 Smart Door Lock AI

An AI-powered smart door lock built using an ESP32 and a servo motor, featuring a modern web interface with face recognition authentication. The system allows only registered users to unlock the door through facial verification, providing a secure, contactless, and intelligent access control solution.

---

# ✨ Features

- 🤖 AI-powered Face Recognition
- 📷 Live Camera Feed
- 👤 Face Registration
- 🔍 Face Verification
- 🔓 Servo-based Door Unlock
- 🔒 Automatic Door Lock after 10 seconds
- 🌐 Wi-Fi Enabled ESP32 Communication
- 💻 Responsive Web Dashboard
- 🎨 Modern Cyber-Themed User Interface
- 📱 Mobile & Desktop Compatible
- ⚡ Real-Time Status Updates
- 📊 Unlock Progress Indicator
- 🟢 Face Detection Overlay
- 🔴 Access Denied Notification
- 🟢 Access Granted Animation
- 🔄 Lock/Unlock Status Indicator

---

# 🛠 Technologies Used

## Hardware

- ESP32-C6
- SG90 Servo Motor
- Push Buttons
- LEDs
- Breadboard
- Jumper Wires
- USB Type-C Cable

---

## Software

- Arduino IDE
- HTML5
- CSS3
- JavaScript
- MediaPipe AI
- TensorFlow.js (Face Recognition)
- ESP32 Web Server
- Wi-Fi

---

# 📂 Project Structure

```
SmartDoorLock/

│
├── SmartDoorLock.ino
├── index.html
├── style.css
├── script.js
│
└── icons/
    ├── logo.png
    ├── lock.png
    └── unlock.png
```

---

# ⚙ Hardware Connections

| ESP32 | Component |
|--------|-----------|
| GPIO 3 | Servo Signal |
| 5V | Servo VCC |
| GND | Servo GND |
| GPIO 8 | Lock Button |
| GPIO 9 | Unlock Button |
| GPIO 2 | Green LED |
| GPIO 4 | Red LED |

> **Use a common ground between the ESP32 and all external components.**

---

# 🚀 How It Works

1. User opens the Smart Door Lock website.
2. Camera starts automatically.
3. User clicks **Register Face** (first time only).
4. Facial data is securely stored.
5. User clicks **Scan Face**.
6. AI verifies the face.
7. If verified:
   - Access Granted
   - Lock icon animates
   - ESP32 receives unlock request
   - Servo rotates to unlock
8. Door remains unlocked for 10 seconds.
9. Door locks automatically.

---

# 📱 Website Dashboard

The web application includes:

- Live Camera Preview
- Face Scanner
- Register Face Button
- Scan Face Button
- Lock Status
- AI Verification Status
- Countdown Timer
- Progress Bar
- Lock Animation

---

# 🔐 Security Features

- Face-Based Authentication
- Automatic Door Lock
- Secure Local Wi-Fi Communication
- Unauthorized Access Detection
- Real-Time Status Monitoring

---

# 📦 Components Required

- ESP32-C6 Development Board
- SG90 Servo Motor
- 2 Push Buttons
- 2 LEDs
- 220Ω Resistors
- Breadboard
- Jumper Wires
- USB Type-C Cable
- 5V Power Supply (Optional)

---

# 📷 Face Recognition Flow

```
Camera

↓

Face Detection

↓

Face Registration

↓

Face Verification

↓

Access Granted

↓

ESP32 Unlock

↓

Servo Opens Door

↓

10 Second Timer

↓

Door Locks Automatically
```

---

# 📡 Communication Flow

```
Website

↓

HTTP Request

↓

ESP32 Web Server

↓

Servo Motor

↓

Door Unlock
```

---

# 🌟 Future Enhancements

- Multi-User Face Registration
- Visitor Access Mode
- OTP Verification
- Mobile Application
- QR Code Unlock
- Fingerprint Authentication
- Voice Unlock
- OLED Display
- Event Logs
- Cloud Database
- Remote Monitoring
- Email Alerts
- Intruder Detection
- Camera Snapshot Storage
- Battery Backup
- Smart Home Integration
- RFID Support
- MQTT Communication
- Firebase Integration
- Admin Dashboard
- Unlock History Analytics

---

# 🎯 Applications

- Smart Homes
- Office Security
- Hostel Rooms
- Laboratories
- Hotel Rooms
- Server Rooms
- Smart Cabinets
- Residential Buildings
- Co-working Spaces

---

# 📖 Future Startup Vision

The project aims to evolve into a complete Smart Access Management Platform featuring AI-powered authentication, cloud connectivity, remote monitoring, visitor management, mobile applications, and enterprise-grade security for homes, offices, and commercial buildings.

---

# 👨‍💻 Author

**Abhay Bakshi**

Electronics & Communication Engineering

AI • IoT • Embedded Systems • Web Development
