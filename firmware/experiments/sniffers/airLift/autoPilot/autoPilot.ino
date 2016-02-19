#include "Pollable.h"
#include "Blinky.h"
#include "Serial.h"
#include "pin.h"
#include "logger.h"

void setup() {
    Serial.begin(115200);
}

uint8_t next(0);

void loop() {

    // W12Serial rs(0);
    // rs.begin(115200);

    // Logger logger(rs);

    W12Serial serial1(1,true);
    serial1.begin(9600);

    W12Serial serial2(2,false);
    serial2.begin(9600);

    Blinky blinky(13,500);

    uint32_t lastNow = 0;

    uint8_t temp(0);

    // // mystery
    // serial1.write(0xfa);
    // serial1.write(0x0e);
    // serial1.write(0xb1);
    // serial1.write(0xac);
    // serial1.write(0x9b);
    // serial1.write(0xf3);

    // Poll?
    // serial1.write(0xfa);
    // serial1.write(0x01);
    // serial1.write(0x00);
    // serial1.write(0x05);
    // serial1.write(0xf3);

    while(true) {
        if (Serial.available()) {
        //if (rs.read(temp)) {
            temp = Serial.read();
            Serial.write('@');
            Serial.write(temp);
            Serial.write(' ');

            uint8_t div = 100;
            for (uint8_t i=0; i<3; ++i) {
                Serial.write(48 + ((temp / div)%10));
                div /= 10;
            }
            Serial.write('\n');
            if (temp == '1') {
                serial1.write(0xfa);
                serial1.write(0x01);
                serial1.write(0x16);
                serial1.write(0x47);
                serial1.write(0x50);
                serial1.write(0x4b);
                serial1.write(0x0f);
                serial1.write(0x50);
                serial1.write(0x4b);
                serial1.write(0x63);
                serial1.write(0xf3);
                Serial.write('!');
                Serial.write('\n');
            }
            if (temp == '2') {
                serial1.write(0xfa);
                serial1.write(0x01);
                serial1.write(0x41);
                serial1.write(0x51);
                serial1.write(0x73);
                serial1.write(0xf3);
                Serial.write('!');
                Serial.write('\n');
            }
            if (temp == '3') {
                serial1.write(0xfa);
                serial1.write(0x01);
                serial1.write(0x41);
                serial1.write(0x00);
                serial1.write(0xc4);
                serial1.write(0xf3);
                Serial.write('!');
                Serial.write('\n');
            }
            if (temp == '4') {
                // fa01416163f3
                serial1.write(0xfa);
                serial1.write(0x01);
                serial1.write(0x41);
                serial1.write(0x61);
                serial1.write(0x63);
                serial1.write(0xf3);
                Serial.write('!');
                Serial.write('\n');
            }
        }
        if (serial1.read(temp)) {
            // rs.write('.');
            // rs.write('\n');
            // serial2.write(temp);
            // rs.write(128);
            // rs.write(temp>>4);
            // rs.write(temp&0xf);
            Serial.write(128);
            Serial.write(temp>>4);
            Serial.write(temp&0xf);
        }
        if (serial2.read(temp)) {
            // serial1.write(temp);
            // rs.write(129);
            // rs.write(temp>>4);
            // rs.write(temp&0xf);
        }

        // if (rs.read(temp)) {
        //     rs.write(temp);
        // }

        Pollable::pollAll();
    }
}
