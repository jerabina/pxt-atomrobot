/*
ATOM robot
Micromi with Robobit expasion board

Harware: 
- P0  Buzzer
- P16 4x NeoPixel
- P13 right encoder
- P12 left encoder

- I2C
    - address 0x40 PCA9685 - 16x PWM driver
        M1A - right motor
        M2B - left motor
        S0:S8 - servo interfaces

    - VL53L0X v2 address 0x29 - Time-of-Flight ranging sensor

*/
/*
namespace robotAtom {
    const PIN_ENC_LEFT = pins.P12;
    const PIN_ENC_RIGHT = pins.P13;
    const PIN_NEOPIXEL = pins.P16;

    const PCA9685_ADDRESS = 0x40;
    const VL53L0X_ADDRESS = 0x29;
}
*/