#ifndef _MESSAGE_H
#define _MESSAGE_H

#include <Arduino.h>

#define MESSAGE_LIST_SIZE 20

class Message {
public:
    Message() {
        mCount = -1;
        mA = 0xff;
        mB = 0xff;
    }

    virtual ~Message() {
    }

    void operator=(Message & message) {
        mCount = message.mCount;
        mA = message.mA;
        mB = message.mB;
    }

    bool operator>(Message & message) {
        return mCount > message.mCount;
    }

    uint8_t getA() {
        return mA;
    }

    uint8_t getB() {
        return mB;
    }

    void setMessage(uint8_t a, uint8_t b) {
        if (a==mA && b==mB) {
            return;
        }
        mA = a;
        mB = b;
        mCount = 0;
    }

    void operator++() {
        ++mCount;
    }

    int32_t getCount() {
        return mCount;
    }

    void dump() {
        if (mA < 16) {
            Serial.print("0");
        }
        Serial.print(mA,HEX);
        Serial.print(" ");
        if (mB < 16) {
            Serial.print("0");
        }
        Serial.print(mB,HEX);
        Serial.print(" ");
        Serial.println(mCount);
    }

private:
    uint8_t mA;
    uint8_t mB;

    int32_t mCount;
};

class MessageList {
public:
    MessageList() {
    }
    virtual ~MessageList() {
    }

    void addMessage(uint8_t a, uint8_t b);

    void dump();

    void sort();

    void randomize();

private:
    Message messages[MESSAGE_LIST_SIZE];
};


#endif