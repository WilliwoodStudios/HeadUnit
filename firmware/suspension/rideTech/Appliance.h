#ifndef _APPLIANCE_H
#define _APPLIANCE_H

#include <Pollable.h>

#include <Arduino.h>
#include <SoftwareSerial.h>

#include "SeekChannel.h"

class Appliance : public Pollable {
public:
    Appliance();
    virtual ~Appliance();

    bool setValves(uint8_t valves);
    bool setDesiredPressures(uint8_t * pressures);

    bool getPressures(uint8_t pressures[5]);

    bool setPreset(uint8_t preset);

    bool setMessageMode(char mode);

    virtual void poll(uint32_t now);

protected:
    void seek(uint32_t now);
    bool isTalking();
    bool validateChecksum();
    bool checkForMessages();
    bool setValvesInternal(uint8_t valves);

private:
    bool mValvesMessageAsSniffed;
    bool mRepeatValveCommands;

    uint8_t mLastPressures[5];
    bool mPressuresValid;

    SeekChannel mSeekChannels[4];

    uint8_t mBuffer[40];
    uint8_t mBufferOffset;

    uint8_t mValves;

    /**
     * Time we last received a byte from the appliance.
     */ 
    uint32_t mLastByteReceived;

    /**
     * Time we started a seek operation.
     */
    uint32_t mTimeSeekStarted;

    /**
     * Time we last received pressures.
     */
    uint32_t mTimeLastPressures;

    /**
     * Time we last performed a valve command.
     */
    uint32_t mTimeLastValveCommand;

    /**
     * Time we sent a non zero valve.
     */
    uint32_t mTimeLastNonZeroValve;

    SoftwareSerial mSerial;

};

#endif