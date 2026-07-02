#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

//==============================
// WiFi Credentials
//==============================

const char* ssid = "IIMCIP";
const char* password = "Iimcip@220814";

//==============================
// GPIO Pins
//==============================

#define SERVO_PIN      18
#define LOCK_BUTTON    8
#define UNLOCK_BUTTON  9
#define RED_LED        4
#define GREEN_LED      2

//==============================

WebServer server(80);
Servo doorServo;

bool isLocked = true;
int servoAngle = 0;

//==============================
// HTML
//==============================



//==============================
// Servo Functions
//==============================

void lockDoor()
{

servoAngle=0;

doorServo.write(servoAngle);

digitalWrite(RED_LED,HIGH);
digitalWrite(GREEN_LED,LOW);

isLocked=true;

Serial.println("Door Locked");

}

void unlockDoor()
{

servoAngle=90;

doorServo.write(servoAngle);

digitalWrite(RED_LED,LOW);
digitalWrite(GREEN_LED,HIGH);

isLocked=false;

Serial.println("Door Unlocked");

}

//==============================
// Web Handlers
//==============================



void handleLock()
{

lockDoor();

server.send(200,"text/plain","LOCKED");

}

void handleUnlock()
{

unlockDoor();

server.send(200,"text/plain","UNLOCKED");

}

void handleStatus()
{

if(isLocked)
server.send(200,"text/plain","LOCKED");
else
server.send(200,"text/plain","UNLOCKED");

}
//==============================
// Setup
//==============================

void setup()
{
  Serial.begin(115200);

  // LEDs
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // Push Buttons
  pinMode(LOCK_BUTTON, INPUT_PULLUP);
  pinMode(UNLOCK_BUTTON, INPUT_PULLUP);

  // Servo
  doorServo.setPeriodHertz(50);
  doorServo.attach(SERVO_PIN, 500, 2400);

  // Start in Locked Position
  lockDoor();

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Web Routes
 
  server.on("/lock", handleLock);
  server.on("/unlock", handleUnlock);
  server.on("/status", handleStatus);

  server.begin();

  Serial.println("Web Server Started");
}

//==============================
// Loop
//==============================

void loop()
{
  server.handleClient();

  // LOCK Button
  if (digitalRead(LOCK_BUTTON) == LOW)
  {
    lockDoor();
    delay(250);
  }

  // UNLOCK Button
  if (digitalRead(UNLOCK_BUTTON) == LOW)
  {
    unlockDoor();
    delay(250);
  }
}