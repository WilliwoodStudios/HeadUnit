#ifndef _LOGGER_H
#define _LOGGER_H

#include "Pollable.h"
#include "Serial.h"

class Logger : public Pollable {
public:
    Logger(W12Serial & serial);
    virtual ~Logger();

    void add(uint8_t source, uint8_t value);

protected:
    virtual void poll(uint32_t now);

    void dumpLine();

private:
    void doHex(uint8_t);

    uint8_t mLineSource;
    uint8_t mLineLength;
    uint8_t mBuffer[16];

    uint32_t mLastUpdate;
    uint32_t mStarted;

    W12Serial & mSerial;
};

#endif