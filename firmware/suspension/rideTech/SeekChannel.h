#ifndef _SEEK_CHANNEL
#define _SEEK_CHANNEL

#include <Arduino.h>

class SeekChannel {
public:
    SeekChannel();
    virtual ~SeekChannel();

    void setup(uint8_t index, uint8_t * currentPressure);

    uint8_t getValves(uint32_t pressureAge, bool & rapid, bool & stillGoing);

    void setDesiredPressure(uint8_t pressure);
    static void setTankPressure(uint8_t * tankPressure);

private:
    uint8_t * mCurrentPressure;
    uint8_t mDesiredPressure;
    static uint8_t * sTankPressure;
    uint32_t mLastPressureTime;

    bool mIsSeeking;
    uint32_t mLastPulseTime;

    int8_t mDirection;

    uint8_t mIndex;
};

#endif