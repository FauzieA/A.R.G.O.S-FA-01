
# 🤖 A.R.G.O.S. FA-01 | Autonomous Robot Guidance & Obstacle Sensing

> **IoT-Enabled Mobile Robot Platform with Hybrid Control Architecture**

## 📖 Overview

**A.R.G.O.S. FA-01** is a prototype IoT mobile robot designed to demonstrate a **Hybrid Architecture** capable of handling high-priority local safety tasks alongside real-time cloud telemetry.

Unlike standard hobbyist projects that rely on polling (like ThingSpeak), this system uses **MQTT over WebSockets** to achieve **<50ms latency**, allowing for a custom React.js dashboard that visualizes the robot's "Digital Twin" in near real-time.

**Key Objective:** Prove that a single dual-core ESP32 can manage a **Prioritized State Machine** (Safety > Navigation > Telemetry) without blocking critical interrupts.

---

## ⚙️ System Architecture

The system follows a standard IoT Edge-to-Cloud pattern:

`[ Robot / Edge Node ]`  ⏩  `[ MQTT Broker (EMQX) ]`  ⏩  `[ React Dashboard ]`

* **Edge:** ESP32-WROOM-32 running FreeRTOS tasks for sensor fusion.
* **Transport:** MQTT over WebSockets (Port 8084) + TLS 1.2 Encryption.
* **Cloud:** EMQX Enterprise Cluster (Low-latency message routing).
* **UI:** Custom React.js Frontend with live JSON parsing and heartbeat monitoring.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/74d22dfc-a3f4-40ff-bc36-cc353bfa6b90" />


---

## 🛠️ Tech Stack

| Component | Technology | Rationale |
| --- | --- | --- |
| **Microcontroller** | **ESP32 (C++)** | Dual-core architecture needed for non-blocking Wi-Fi & Motor logic. |
| **Connectivity** | **MQTT (WSS)** | Selected over HTTP/REST for lower overhead and battery efficiency. |
| **Frontend** | **React.js** | chosen over ThingSpeak to bypass the 15s polling limit for safety monitoring. |
| **Simulation** | **Wokwi** | Used for rapid logic prototyping and hardware emulation. |
| **Design Pattern** | **State Machine** | Prioritized logic ensures Safety overrides Navigation. |

---

## 🚀 Key Features

### 1. Prioritized Control Logic (The "Brain")

The robot does not run a simple loop; it follows a strict hierarchy of needs:

* 🔴 **CRITICAL (Hardware Interrupt):** If Obstacle < 20cm  **HARD STOP**.
* 🟡 **HIGH:** If Line Deviation detected  **CORRECTION (PID-like turn)**.
* 🟢 **NORMAL:** If Path Clear  **CRUISE**.

### 2. Custom "Live-Link" Dashboard

Built from scratch to solve the "blind spot" problem.

* **Latency Graph:** Visualizes connection stability.
* **Link Timeout Alert:** Triggers a red "SIGNAL LOST" warning if data packets pause for >2 seconds.
* **Digital Twin:** Visualizes compass heading and raw sensor data.

### 3. Power Management Strategy

* Implements an **Idle Watchdog**.
* If no movement commands are processed for >10 seconds, the system enters **Deep Sleep** mode to conserve battery (simulated via Dashboard "LOW PWR" status).

---

## 💻 Simulation vs. Hardware Reality

This project was prototyped using the **Wokwi** simulation environment. To ensure the code is "Deployment Ready" for the physical **Yahboom Omniduino** platform, I implemented several engineering workarounds:

* **"Ghost" Drivers:** Since Wokwi lacks Camera/GPS support, I wrote firmware routines (`updateGhostModules`) to simulate data initialization and payload packaging.
* **IR Sensor Simulation:** 5x Tactile Pushbuttons are used to manually trigger digital logic for the Line Following algorithm (L2, L1, Center, R1, R2).
* **Sensor Offset:** The simulated Ultrasonic sensor has a known ~1cm systematic error. I chose to display the **raw data** on the dashboard rather than filtering it, to accurately reflect hardware drift.

---

## 📸 Media & Demo

### The Dashboard Interface
<img width="2838" height="1691" alt="image" src="https://github.com/user-attachments/assets/d4109573-c756-4de1-8609-f166824da8b1" />


### The Wokwi Circuit

<img width="1143" height="760" alt="image" src="https://github.com/user-attachments/assets/4a56269e-6761-4158-90ab-89db368ead40" />


---

## ⚡ How to Run

### 1. The Firmware (ESP32)

The code is written for the Arduino IDE / Wokwi Simulator.

1. Open the `firmware/` folder.
2. Update `ssid` and `password` in `secrets.h`.
3. Flash to ESP32 Dev Module.

### 2. The Dashboard (React)

1. Navigate to `dashboard/` directory.
2. Run `npm install` to grab dependencies (MQTT.js, Recharts).
3. Run `npm start`.
4. Open `http://localhost:3000`.

---

## 🧠 What I Learned

Building FA-01 shifted my perspective from "making code work" to "designing resilient systems."

* **Latency Matters:** Migrating from a public MQTT broker to an enterprise cluster dropped latency from ~200ms to <50ms.
* **Honesty in Engineering:** Dealing with the "Sensor Offset" taught me that handling noisy data is better than hiding it.
* **Concurrency:** Managing Wi-Fi stacks alongside motor PWM signals required careful timing analysis to prevent watchdog resets.

---

## 📬 Contact

**Fauziyya Abdullahi Ahmed**

* Aspiring IoT / Embedded Systems Engineer
* https://www.linkedin.com/in/fauziyya-ahmed/
* fauxieahmed22@gmail.com

