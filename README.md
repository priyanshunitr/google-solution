# 🚨 Smart Emergency Response System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20mobile-lightgrey)

## 📌 Overview

The **Smart Emergency Response System** is a real-time safety solution designed for hotels, campuses, and large facilities. It integrates fire detection systems, guest applications, staff devices, and emergency services into a unified network.

The goal is to **reduce response time**, **improve coordination**, and **enhance safety** by sharing live alerts, location data, and actionable insights.

---

## 🏗️ System Architecture

The system is composed of four main components:

### 🔥 Fire Detection System
- Detects fire using smoke sensors  
- Automatically triggers alarms  
- Sends signals to the central system  

### 📱 Guest Mobile App / Room Systems
- Detects issues (manual or automated)
- Shares:
  - Location via Google Maps API
  - Distress signals
- Supports manual reporting without sensors  

### 🧑‍💼 Staff Devices
- Receives alerts from all sources  
- Displays:
  - Location
  - Severity  
- Enables evacuation coordination  
- Uses Google Maps API for navigation  

### 🚑 Emergency Services
- Automatically notified  
- Receives:
  - Fire location  
  - Floor plans  
- Connects with:
  - Fire department  
  - Police  
  - Hospitals  

---

## 🔄 Workflow

1. Fire or issue is detected (sensor or user input)  
2. Alert is sent to the central system  
3. Guest app shares location and context  
4. Staff devices receive alerts  
5. Staff coordinates evacuation  
6. Emergency services are notified  
7. Live data is shared for rapid response  

---

## ✨ Features

- ⚡ Real-time alert system  
- 📍 Location tracking (Google Maps API)  
- 🔁 Bidirectional communication  
- 🚨 Automated escalation  
- 🧭 Smart evacuation coordination  
- 🏥 Emergency service integration  

---

## 🛠️ Tech Stack

| Layer       | Technology                |
|------------|--------------------------|
| Frontend   | React / React Native     |
| Backend    | Node.js / Express        |
| Database   | MongoDB                  |
| APIs       | Google Maps API          |
| Realtime   | WebSockets / Firebase    |
| Cloud      | AWS / GCP                |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/emergency-response-system.git

# Navigate into the project directory
cd emergency-response-system

# Install dependencies
npm install

# Run the development server
npm run dev

# Run any ts file
npx tsx src/lib/<filename.ts>
npx ts-node src/lib/<filename.ts>
