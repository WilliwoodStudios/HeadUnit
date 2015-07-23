#include "SeekChannel.h"

SeekChannel::SeekChannel() {
    mCurrentPressure = 0;
    mDesiredPressure = 0;
    mIsSeeking = false;
    mDirection = 0;
    mIndex = 0;
}

SeekChannel::~SeekChannel() {
}

void SeekChannel::setup(uint8_t index, uint8_t * currentPressure) {
    mCurrentPressure = currentPressure;
    mIndex = index;
}

static uint8_t add[] = { 0x80, 0x20, 0x8, 0x2};
static uint8_t sub[] = { 0x40, 0x10, 0x4, 0x1};

uint8_t SeekChannel::getValves(uint32_t pressureAge, bool & rapid, bool & stillGoing) {
    if (mIsSeeking) {
        if (mDirection == 1) {
            int8_t current = *mCurrentPressure;
            if (current > mDesiredPressure && current - mDesiredPressure > 3) {
                // do nothing - stop seeking.
            } else {
                stillGoing = true;
                return add[mIndex];
            }
        } else if (mDirection == -1) {
            int8_t current = *mCurrentPressure;
            if (current < mDesiredPressure) {
                // do nothing.
            } else {
                if (pressureAge == mLastPressureTime) {
                    stillGoing = true;
                    return 0;
                } else {
                    stillGoing = true;
                    mLastPressureTime = pressureAge;
                    if (current >= 15 && mDesiredPressure >= 15) {
                        uint32_t now = millis();
                        if (mLastPulseTime != 0 && now - mLastPulseTime < 250)  {
                            return 0;
                        }
                        mLastPulseTime = now;

                        rapid = true;
                    }
                    return sub[mIndex];
                }
            }
        }
    }
    mIsSeeking = false;
    return 0;
}

void SeekChannel::setDesiredPressure(uint8_t pressure) {
    mDesiredPressure = pressure;

    mIsSeeking = true;
    mDirection = 0;
    
    int16_t diff = mDesiredPressure;
    diff -= *mCurrentPressure;

    if (diff >= -5 && diff <= 2) {
        // do nothing... we are close enough.
    } else if (diff > 0) {
        mDirection = 1;
    } else if (diff < 0) {
        mDirection = -1;
        mLastPulseTime = 0;
    }

    if (mDirection == 0) {
        mIsSeeking = false;
    }
}

void SeekChannel::setTankPressure(uint8_t * pressure) {
    sTankPressure = pressure;
}

uint8_t * SeekChannel::sTankPressure = 0;