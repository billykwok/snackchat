#include <Servo.h>

#define PIN_SERVO_STAGE 9
#define ANGLE_COLLAPSE 105
#define ANGLE_EXPAND 0

Servo servoStage;

void setup()
{
  Serial.begin(9600);
  servoStage.attach(PIN_SERVO_STAGE);
}

void loop()
{
  servoStage.write(100);
  delay(50);
  servoStage.write(90);
  delay(50);
}
