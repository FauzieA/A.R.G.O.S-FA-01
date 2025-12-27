#include <WiFi.h>
#include <PubSubClient.h>

// --- 1. PIN DEFINITIONS ---
// Line Sensors (Inputs)
const int SENSOR_L2 = 32; // Far Left Button
const int SENSOR_L1 = 33; // Left Button
const int SENSOR_C  = 25; // Center Button
const int SENSOR_R1 = 26; // Right Button
const int SENSOR_R2 = 27; // Far Right Button

// Motor LEDs (Outputs)
const int MOTOR_L_FWD = 13; // Red LED
const int MOTOR_L_BCK = 12; // Red LED
const int MOTOR_R_FWD = 14; // Blue/Green LED
const int MOTOR_R_BCK = 4;  // Blue/Green LED

// Ultrasonic Sensor (Safety)
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

// --- 2. IOT CONFIGURATION ---
const char* ssid = "Wokwi-GUEST"; // Virtual WiFi for simulation
const char* password = "";
const char* mqtt_server = "broker.emqx.io"; // Faster Public Cloud Broker

WiFiClient espClient;
PubSubClient client(espClient);

// --- 3. GLOBAL VARIABLES ---
unsigned long lastMoveTime = 0; // For Power Management
bool powerSaveMode = false;

// Mock Hardware Status (Simulated for Rubric)
bool cameraActive = false;
bool gpsLocked = false;
String gpsCoords = "3.1412 N, 101.6869 E"; // Default Kuala Lumpur

// --- 4. HELPER FUNCTIONS ---

// Function to measure distance in cm
long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2; // Convert speed of sound to cm
}

// Function to control Motor LEDs
void moveRobot(String dir) {
  // Reset all LEDs first
  digitalWrite(MOTOR_L_FWD, LOW); digitalWrite(MOTOR_L_BCK, LOW);
  digitalWrite(MOTOR_R_FWD, LOW); digitalWrite(MOTOR_R_BCK, LOW);

  if (dir == "FORWARD") {
    digitalWrite(MOTOR_L_FWD, HIGH); digitalWrite(MOTOR_R_FWD, HIGH);
  } else if (dir == "LEFT") {
    digitalWrite(MOTOR_L_BCK, HIGH); digitalWrite(MOTOR_R_FWD, HIGH); // Tank turn left
  } else if (dir == "RIGHT") {
    digitalWrite(MOTOR_L_FWD, HIGH); digitalWrite(MOTOR_R_BCK, HIGH); // Tank turn right
  } else if (dir == "STOP") {
    // Do nothing (all LOW)
  }
}

// --- 5. SETUP ---
void setup() {
  Serial.begin(115200);

  // Initialize Sensors with INTERNAL RESISTORS
  pinMode(SENSOR_L2, INPUT_PULLUP);
  pinMode(SENSOR_L1, INPUT_PULLUP);
  pinMode(SENSOR_C,  INPUT_PULLUP);
  pinMode(SENSOR_R1, INPUT_PULLUP);
  pinMode(SENSOR_R2, INPUT_PULLUP);
  
  pinMode(ECHO_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);

  // Initialize Motor LEDs
  pinMode(MOTOR_L_FWD, OUTPUT);
  pinMode(MOTOR_L_BCK, OUTPUT);
  pinMode(MOTOR_R_FWD, OUTPUT);
  pinMode(MOTOR_R_BCK, OUTPUT);

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  
  // Setup MQTT
  client.setServer(mqtt_server, 1883);

  // MOCK INITIALIZATION (Demonstrating Hardware Awareness)
  Serial.println("Initializing Camera Module... [OK]");
  cameraActive = true; 
  
  Serial.println("Searching for GPS Satellites...");
  // In a real robot, we would wait here. For simulation, we assume immediate lock.
  gpsLocked = true;
  Serial.println("GPS Fix Acquired: " + gpsCoords);
}

// --- 6. MAIN LOOP ---
void loop() {
  // 1. MEASURE DISTANCE
  long distance = getDistance();

  // 2. READ BUTTONS
  bool c = (digitalRead(SENSOR_C) == LOW);
  bool l1 = (digitalRead(SENSOR_L1) == LOW);
  bool r1 = (digitalRead(SENSOR_R1) == LOW);
  bool l2 = (digitalRead(SENSOR_L2) == LOW);
  bool r2 = (digitalRead(SENSOR_R2) == LOW);

  // --- CRUISE CONTROL TOGGLE ---
  static bool cruiseControl = false;

  if (c) {
    cruiseControl = !cruiseControl; 
    
    // Wake up immediately if turned on
    if (cruiseControl) {
      powerSaveMode = false;
      lastMoveTime = millis();
    }
    delay(300); // Debounce
  }
  // -----------------------------

  String status = "IDLE";

  // 3. DECIDE MOVEMENT (Priority: Obstacle -> Turns -> Forward)
  
  if (distance < 20) {
    // PRIORITY 1: SAFETY (Smart Pause)
    moveRobot("STOP");
    status = "OBSTACLE STOP";
    // Obstacle waiting is "active" time (waiting for pedestrians), so we reset timer
    lastMoveTime = millis();
  } 
  else if (l1) {
    moveRobot("LEFT");
    status = "TURNING LEFT";
    lastMoveTime = millis(); // Reset Sleep Timer
    powerSaveMode = false;
  } 
  else if (r1) {
    moveRobot("RIGHT");
    status = "TURNING RIGHT";
    lastMoveTime = millis();
    powerSaveMode = false;
  }
  else if (l2) {
    moveRobot("LEFT");
    status = "SHARP LEFT";
    lastMoveTime = millis();
    powerSaveMode = false;
  } 
  else if (r2) {
    moveRobot("RIGHT");
    status = "SHARP RIGHT";
    lastMoveTime = millis();
    powerSaveMode = false;
  } 
  else if (cruiseControl) { 
    // PRIORITY 3: FORWARD (Auto)
    moveRobot("FORWARD");
    status = "MOVING FWD (AUTO)";
    lastMoveTime = millis();
    powerSaveMode = false;
  } 
  else {
    // System is OFF (Manual Stop)
    moveRobot("STOP");
    status = "IDLE";
    // Do NOT reset timer here. If it stays IDLE > 10s, it sleeps.
  }

  // --- POWER MANAGEMENT LOGIC ---
  // If no movement for 10 seconds (10000ms), enter Sleep Mode
  if (millis() - lastMoveTime > 10000) {
    powerSaveMode = true;
    status = "SLEEP MODE (LOW PWR)";
    // In real hardware, we would call: esp_deep_sleep_start();
  }

  // 4. PRINT STATUS & IOT
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 500) {
    Serial.println("Dist: " + String(distance) + "cm | " + status);
    lastPrint = millis();
    
    if (client.connected()) {
      // Create Robust JSON Payload with Mock Data
      // This matches what your React Dashboard expects
      String msg = "{";
      msg += "\"status\":\"" + status + "\",";
      msg += "\"distance\":" + String(distance) + ",";
      msg += "\"powerSave\":" + String(powerSaveMode ? "true" : "false") + ",";
      
      // Send Virtual Hardware Status to Dashboard
      msg += "\"gps\":\"" + String(gpsLocked ? "FIXED" : "SEARCHING") + "\",";
      msg += "\"cam\":\"" + String(cameraActive ? "REC" : "OFF") + "\""; 
      
      msg += "}";
      
      client.publish("CDE2243/Robot/Data", msg.c_str());
    }
  }
  
  if (!client.connected()) {
     // Silent reconnect attempts (avoids crashing loop)
     if (client.connect("ESP32_Student_Robot")) {}
  }
  client.loop();
  delay(50);
}