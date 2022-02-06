//% color="#4d00b5" icon="\uf135" block="Robot ATOM"
//% category="Robot ATOM"
namespace robotAtom {
    const PCA9685_ADDRESS = 0x40;
    const MODE1 = 0x00;
    const PRESCALE = 0xFE;
    const LED0_ON_L = 0x06;
    const PIN_ENC_LEFT = pins.P12;
    const PIN_ENC_RIGHT = pins.P13;
    const PIN_UTRS_ECHO = pins.P14;
    const PIN_UTRS_TRIG = pins.P15;

    export enum Servos {
        S1 = 0x01,
        S2 = 0x02,
        S3 = 0x03,
        S4 = 0x04,
        S5 = 0x05,
        S6 = 0x06,
        S7 = 0x07,
        S8 = 0x08
    }

    export enum Motors {
        right = 0x1, // right motor
        left = 0x4  // left motor
    }
    let motorsBiasRight = 0;
    let motorsBiasLeft = 0;

    let initialized = false;

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(addr, buf);
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1);
        buf[0] = value;
        pins.i2cWriteBuffer(addr, buf);
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00);
        setFreq(50);
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true;
    }

    function setFreq(freq: number): void {
        freq *= 0.9;

        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = Math.floor(prescaleval + 0.5);

        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10;
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode);
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15) return;
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }


    // motors function
    function stopMotor(index: number) {
        setPwm((index - 1) * 2, 0, 0);
        setPwm((index - 1) * 2 + 1, 0, 0);
    }


    /**
     * To help the :MOVE motor drive in a straight line you can bias the motors.
     * @param balance number between 0 and 10 to help balance the motor speed
     */
    //% blockId=robotAtom_motor_balance
    //% subcategory="Motors"
    //% weight=85 blockGap=8
    //% block="motor bias to %motor by %balance"
    //% balance.min=0 balance.max=10
    export function motorBalance(motor: Motors, balance: number): void {
        switch (motor) {
            case Motors.right:
                motorsBiasRight = Math.round(balance * 1.75);
                break;
            case Motors.left:
                motorsBiasLeft = Math.round(balance * 1.75);
                break;
        }
    }

    //% blockId=robotAtom_motor_run block="Motor|%index|speed %speed"
    //% subcategory="Motors"
    //% weight=85
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }

    //% blockId=robotAtom_stop block="Motor Stop|%index|"
    //% subcategory="Motors"
    //% weight=80
    export function MotorStop(index: Motors): void {
        MotorRun(index, 0);
    }

    //% blockId=robotAtom_stop_all block="Motor Stop All"
    //% subcategory="Motors"
    //% weight=79
    //% blockGap=50
    export function MotorStopAll(): void {
        if (!initialized) {
            initPCA9685()
        }
        stopMotor(Motors.left);
        stopMotor(Motors.right);
    }

//% blockId=robotAtom_motor_run block="Motor|%index|speed %speed"
    //% subcategory="Motors"
    //% weight=85
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4

    /**
     * Execute two motors at the same time
     * @param speedLeft [-255-255] speed of motor; eg: 150, -150
     * @param speedRight [-255-255] speed of motor; eg: 150, -150
    */
    //% blockId=robotAtom_MotorRunBoth
    //% subcategory="Motors"
    //% block="Motor speed |left %speedLeft|right %speedRight"
    //% inlineInputMode=inline
    //% weight=84
    //% speedLeft.min=-255 speedLeft.max=255
    //% speedRight.min=-255 speedRight.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRunBoth(speedLeft: number, speedRight: number): void {
        MotorRun(Motors.left, speedLeft);
        MotorRun(Motors.right, speedRight);
    }

    /**
     * Servo Execute
     * @param index Servo Channel; eg: S1
     * @param degree [0-180] degree of servo; eg: 0, 90, 180
    */
    //% blockId=robotAtom_servo block="Servo %index|degree %degree"
    //% subcategory="Motors"
    //% weight=100
    //% degree.min=0 degree.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Servo(index: Servos, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }

}