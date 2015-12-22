#include "Pollable.h"
#include "Blinky.h"
#include "Serial.h"
#include "pin.h"
#include "logger.h"

void setup() {
}

uint8_t next(0);

void loop() {

    W12Serial rs(0);
    rs.begin(115200);

    // Logger logger(rs);

    W12Serial serial1(1,true);
    serial1.begin(9600);

    W12Serial serial2(2,false);
    serial2.begin(9600);

    Blinky blinky(13,500);

    uint32_t lastNow = 0;

    uint8_t temp(0);

    while(true) {
        if (serial1.read(temp)) {
            if (temp == 0xfe) {
                serial1.write('!');
            }
            // logger.add(0,temp);
            serial2.write(temp);
            rs.write(128);
            rs.write(temp>>4);
            rs.write(temp&0xf);
        }
        if (serial2.read(temp)) {
            // logger.add(1,temp);
            serial1.write(temp);
            rs.write(129);
            rs.write(temp>>4);
            rs.write(temp&0xf);
        }

        // if (rs.read(temp)) {
        //     rs.write(temp);
        // }

        Pollable::pollAll();
    }
}
