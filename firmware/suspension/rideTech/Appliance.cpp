#include "Appliance.h"

#define TALKING_TIMEOUT_MS 60000
#define REPEAT_VALVE_COMMAND_DELAY_MS 333
#define TIME_ALLOWED_WITH_NON_ZERO_VALVES_MS 45000
#define SEEK_TIMEOUT_MS 20000

Appliance::Appliance() : mSerial(10,11), mBufferOffset(0), 
        mPressuresValid(false), mTimeSeekStarted(0), 
        mTimeLastPressures(0), mTimeLastValveCommand(0),
        mValvesMessageAsSniffed(true), mRepeatValveCommands(true),
        mValves(0), mTimeLastNonZeroValve(0) {
    pinMode(10,INPUT);
    pinMode(11,OUTPUT);

    mSerial.begin(9600);

    SeekChannel::setTankPressure(&mLastPressures[4]);
    for (uint8_t i = 0; i<4; ++i) {
        mSeekChannels[i].setup(i,&mLastPressures[i]);
        mSeekChannels[i].setDesiredPressure(0);
    }

    mLastPressures[0] = 1;
    mLastPressures[1] = 2;
    mLastPressures[2] = 3;
    mLastPressures[3] = 4;

    mLastPressures[4] = 12;
    mPressuresValid = true;
}

Appliance::~Appliance() {
    pinMode(10,INPUT);
    pinMode(11,INPUT);
}

uint32_t lastSeekStart = 0;
uint32_t mLastPressurePrint = 0;

void Appliance::poll(uint32_t now) {
    if (lastSeekStart != mTimeSeekStarted) {
        lastSeekStart = mTimeSeekStarted;
        // Serial.print("Seek ");
        // Serial.println(mTimeSeekStarted);
    }
    if (mTimeLastNonZeroValve != 0 && now - mTimeLastNonZeroValve > TIME_ALLOWED_WITH_NON_ZERO_VALVES_MS) {
        // Cancel seek and set valves to 0.
        // Serial.println("Canelling");
        // Serial.println(now - mTimeLastNonZeroValve);
        setValvesInternal(0);
        mTimeSeekStarted = 0;
    }
    while(mSerial.available()) {
        uint8_t next = mSerial.read();
        if (next == 0xff) {
            mBufferOffset = 0;
        } else if (mBufferOffset == 0) {
            continue;
        }
        mBuffer[mBufferOffset++] = next;
        mBufferOffset %= sizeof(mBuffer);
        mLastByteReceived = now;
        if (mBufferOffset > 5) {
            if (checkForMessages()) {
                break;
            }
        }
    }
    if (mTimeSeekStarted != 0 && now > mTimeLastValveCommand && (now-mTimeLastValveCommand) > 250) {
        // Serial.print("R ");
        // Serial.println(now - mTimeLastValveCommand);
        seek(now);

    }
    if (mRepeatValveCommands && now - mTimeLastValveCommand > REPEAT_VALVE_COMMAND_DELAY_MS) {
        setValvesInternal(mValves);
    }
    // if (now - mLastPressurePrint >= 100) {
    //     Serial.print("----\t");
    //     Serial.print(now);
    //     for (uint8_t i=0; i<5; ++i) {
    //         Serial.print("\t");
    //         Serial.print(mLastPressures[i]);
    //     }
    //     Serial.println();
    //     mLastPressurePrint = now;
    // }
}

void Appliance::seek(uint32_t now) {
    if (mTimeSeekStarted != 0) {
        if (now > mTimeSeekStarted && now - mTimeSeekStarted > SEEK_TIMEOUT_MS) {
            mTimeSeekStarted = 0;
            setValvesInternal(0);
            return;
        }
    }

    bool stillGoing = false;
    for (uint8_t i=0; i<2; ++i) {
        uint8_t mask = 0;
        stillGoing = false;
        bool rapid = false;

        for (uint8_t i=0; i<4; ++i) {
            mask |= mSeekChannels[i].getValves(mTimeLastPressures,rapid,stillGoing);
        }
        setValvesInternal(mask);

        if (!rapid) {
            break;
        }
    }
    if (!stillGoing) {
        mTimeSeekStarted = 0;
    }
}

bool Appliance::validateChecksum() {
    uint8_t runningTotal = 0;
    for (uint8_t i = 1; i<mBufferOffset-1;++i) {
        runningTotal += mBuffer[i];
    }
    runningTotal ^= 0xff;
    ++runningTotal;    
    if (mBuffer[mBufferOffset-1] != runningTotal) {
        // Serial.print("Expected: ");
        // Serial.print(runningTotal);
        // Serial.print(" Got: ");
        // Serial.println(mBuffer[mBufferOffset-1]);
    }
    return mBuffer[mBufferOffset-1] == runningTotal;
}

uint8_t knownPressure[5];

bool Appliance::checkForMessages() {
    bool result = false;
    if (mBufferOffset == 9) {
        if (mBuffer[1] == 0x25 && mBuffer[2] == 0x4f) {
            bool changed = false;
            if (validateChecksum()) {
                result = true;
                for (uint8_t i=0; i<5; ++i) {
                    mLastPressures[i] = mBuffer[i+3];
                    if (knownPressure[i] != mLastPressures[i]) {
                        changed = true;
                    }
                    knownPressure[i] = mLastPressures[i];
                }
                mPressuresValid = true;
                // if (changed) {
                //     Serial.print("----- ");
                //     Serial.print(millis());
                //     Serial.print(" G ");
                //     for (uint8_t i=0; i<5; ++i) {
                //         Serial.print(knownPressure[i]);
                //         Serial.print(" ");
                //     }
                //     Serial.println();

                // }
                mTimeLastPressures = millis();
                if (mTimeSeekStarted != 0) {
                    seek(mTimeLastPressures);
                }
            }
        }
    } else if (mBufferOffset == 13) {
        // Serial.println("length 13");
        if (mBuffer[1] == 0x29 && mBuffer[2] == 0xcf) {
            if (validateChecksum()) {
                result = true;
                for (uint8_t i=0; i<5; ++i) {
                    mLastPressures[i] = mBuffer[i+7];
                }
                mPressuresValid = true;
            }
            mBufferOffset = 0;
            mTimeLastPressures = millis();
        }
    }
    return result;
}

bool Appliance::getPressures(uint8_t pressures[5]) {
    if (!isTalking()) {
        // Serial.println("Not talking");
        return false;
    }
    if (!mPressuresValid) {
        // Serial.println("Not valid");
        return false;
    }
    for (uint8_t i=0; i<5; ++i) {
        pressures[i] = mLastPressures[i];
    }
    return true;
}

bool Appliance::setValves(uint8_t valves) {
    mTimeSeekStarted = 0;
    return setValvesInternal(valves);
}

bool Appliance::setPreset(uint8_t preset) {
    if (preset < 1 || preset > 3) {
        return false;
    }
    setValves(0); // cancels any ongoing seek...
    uint8_t buffer[5];
    buffer[0] = 0xff;
    buffer[1] = 0x12;
    buffer[2] = 0;
    buffer[3] = preset + 4;
    buffer[4] = 0 - buffer[1] - buffer[2] - buffer[3];
    mSerial.write(buffer,5);
    return true;
}

bool Appliance::setValvesInternal(uint8_t valves) {    
    // RPW - disable for testing?
    // if (valves!=0 && !isTalking()) {
    //     Serial.println("!TAlking");
    //     return false;
    // }

    // Check that +&- isn't on for any channels.
    uint8_t sanity = valves;
    for (uint8_t i=0; i<4; ++i) {
        if ((sanity & 3) == 3) {
            // Serial.println("Insanity");
            return false;
        }
        sanity >>= 2;
    }

    // Record the last non zero, so we can cancel it later.
    if (valves == 0) {
        mTimeLastNonZeroValve = 0;
    } else if (mTimeLastNonZeroValve==0) {
        mTimeLastNonZeroValve = millis();
    }

    mValves = valves;

    uint8_t buffer[5];
    buffer[0] = 0xff;
    if (mValvesMessageAsSniffed) {
        buffer[1] = 0x11;
        buffer[2] = 0x80;
    } else {
        buffer[1] = 0x12;
        buffer[2] = 0x10;
    }
    buffer[3] = valves;
    buffer[4] = 0 - (buffer[1] + buffer[2] + buffer[3]);

    mSerial.write(buffer,5);


    // Serial.print("V: ");
    // Serial.println(mValves,HEX);
    // Serial.print("Since last: ");
    // Serial.println(millis() - mLastByteReceived);
    mTimeLastValveCommand = millis();

    return true;
}

bool Appliance::setMessageMode(char mode) {
    switch(mode) {
        case 'r':
            mRepeatValveCommands = true;
            break;
        case 'R':
            mRepeatValveCommands = false;
            break;
        case 's':
            mValvesMessageAsSniffed = true;
            break;
        case 'S':
            mValvesMessageAsSniffed = false;
            break;
        default:
            return false; 
    }
    return true;
}

bool Appliance::setDesiredPressures(uint8_t * desiredPressures) {
    // if (!isTalking()) {
    //     return false;
    // }
    mTimeSeekStarted = millis();
    for (uint8_t i=0; i<4; ++i) {
        mSeekChannels[i].setDesiredPressure(desiredPressures[i]);
    }
    setValvesInternal(0);
    return true;
}

bool Appliance::isTalking() {
    uint32_t now = millis();
    return (now - mLastByteReceived) < TALKING_TIMEOUT_MS;
}