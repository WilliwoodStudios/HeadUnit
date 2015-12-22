#include "Serial.h"
#include "Pollable.h"
#include "Blinky.h"


W12Serial serial(0,true);

class Spammer : public Pollable {
public:
    Spammer() {
        mNext = millis() + 1000;
    }
    virtual ~Spammer() {
    }
protected:
    virtual void poll(uint32_t now) {
        if (now > mNext) {
            mNext = now + 1000;

            uint8_t j = rand() % 5 + 2;

            serial.write(0xfa);
            for (uint8_t i = 0; i < j; ++i) {
                serial.write(rand());
            }
            serial.write(0xfe);
        }
    }
private: 
    uint32_t mNext;
};

Spammer spammer;

void setup() {
    serial.begin(9600);
}

void loop() {
    Pollable::pollAll();
}