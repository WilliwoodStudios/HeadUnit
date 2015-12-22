#include "logger.h"

Logger::Logger(W12Serial & serial) : mSerial(serial), mLineSource(0xff), mLineLength(0), mLastUpdate(millis()) {
}

Logger::~Logger() {

}

void Logger::add(uint8_t which, uint8_t value) {
    if (mLineSource != 0xff && mLineSource != which) {
        dumpLine();
    }
    mLineSource = which;
    mLastUpdate = millis();
    if (mLineLength == 0) {
        mStarted = mLastUpdate;
    }
    mBuffer[mLineLength++] = value;
    if (mLineLength == 16) {
        dumpLine();
    }
}

void Logger::poll(uint32_t now) {
    if (mLineLength!=0 && now - mLastUpdate > 100) {
        dumpLine();
    }
}

void Logger::doHex(uint8_t val) {
    val &= 0xf;
    if (val > 9) {
        mSerial.write('a'-10+val);
    } else {
        mSerial.write('0'+val);
    }
}

void Logger::dumpLine() {
    if (mLineLength==0) {
        return;
    }

    uint8_t toWrite;

    switch(mLineSource) {
        case 0:
        toWrite = '>';
        break;
        case 1:
        toWrite = '<';
        break;
        toWrite = '-';
    }

    mSerial.write(toWrite);
    mSerial.write(' ');

    doHex(mStarted>>28);
    doHex(mStarted>>24);
    doHex(mStarted>>20);
    doHex(mStarted>>16);
    doHex(mStarted>>12);
    doHex(mStarted>>8);
    doHex(mStarted>>4);
    doHex(mStarted);

    mSerial.write(':');
    mSerial.write(' ');

    for (uint8_t i=0; i<16; ++i) {
        if (i < mLineLength) {
            doHex(mBuffer[i]>>4);
            doHex(mBuffer[i]);
        } else {
            mSerial.write(' ');
            mSerial.write(' ');
        }
        if (i%2==1) {
            mSerial.write(' ');
        }
    }

    mSerial.write(' ');
    for (uint8_t i=0; i<16; ++i) {
        if (i<mLineLength) {
            uint8_t next = mBuffer[i];
            if (next >= 32 && next <= 127) {
                mSerial.write(next);
            } else {
                mSerial.write('.');
            }
        }
    }

    mSerial.write('\n');

    mLineLength = 0;
}