#include <Blinky.h>
#include <LineReader.h>
#include <SerialNumber.h>
#include <WS12Constants.h>
#include <SoftwareSerial.h>

#include "constants.h"
#include "appliance.h"

LineReader lineReader;
Blinky blinky(13,1000);
Appliance appliance;

void setup() {
    Serial.begin(9600);
}

void doId() {
    productDetails.print();
    SerialNumber::print();
}

void doSer(char * command, int length) {
  if (length != 20) {
    WS12::errorSerUsage.print();
  } else {
    SerialNumber::store(command + 4, length - 4);
    doId();
  }
}

void doGet() {
    uint8_t pressures[5];
    Serial.print("[");
    if (!appliance.getPressures(pressures)) {
    } else {
        for (uint8_t i =0; i<5; ++i) {
            if (i != 0) {
                Serial.print(",");
            }
            Serial.print(pressures[i]);
        }
    }
    Serial.print("]");
}

bool parseInt(char * buffer, uint8_t length, uint8_t & offset, uint8_t & value) {
    bool toReturn = false;
    value = 0;
    while(offset < length) {
        char current = buffer[offset];
        Serial.print("Parse Int: ");
        Serial.println(buffer[offset]);
        if (current >= '0' && current <='9') {
            value *= 10;
            toReturn = true;
            value += current - '0';
        } else {
            break;
        }
        ++offset;
    }
    Serial.print("ToReturn: ");
    Serial.println(toReturn ? "true" : "false");
    Serial.println(value);
    return toReturn;
}

bool parseHex(char * buffer, uint8_t length, uint8_t & offset, uint8_t & value) {
    bool toReturn = false;
    value = 0;
    while(offset < length) {
        char current = buffer[offset];
        if (current >= '0' && current <'9') {
            toReturn = true;
            value <<= 4;
            value |= (current - '0');
        } else if (current >= 'a' && current <= 'f') {
            toReturn = true;
            value <<= 4;
            value |= (current - 'a' + 10);
        } else if (current >= 'A' && current <= 'F') {
            toReturn = true;
            value <<= 4;
            value |= (current - 'A' + 10);
        } else {
            break;
        }
        ++offset;
    }
    return toReturn;
}

void doValves(char * buffer, uint8_t length) {
    uint8_t value;
    uint8_t offset = 2;
    if (parseHex(buffer,length,offset,value)) {
        if (appliance.setValves(value)) {
            resultOK.print();
        } else {
            resultFail.print();
        }
    } else {
        WS12::questionMarks.print();
    }
}

void doPressure(char * buffer, uint8_t length) {
    uint8_t pressures[4];
    uint8_t offset = 2;
    bool good = true;
    uint8_t count = 0;
    bool expectingComma = false;
    while(offset < length && good && count < 4) {
        if (expectingComma) {
            if (buffer[offset] == ',') {
                // excellent.
            } else {
                break;
            }
            ++offset;
            expectingComma = false; 
        } else {
            good = parseInt(buffer,length,offset,pressures[count]);
            if (!good) {
                break;
            }
            expectingComma = true;
            ++count;
        }
    }

    if (offset != length || count!=4) {
        WS12::questionMarks.print();
    } else {
        if (appliance.setDesiredPressures(pressures)) {
            resultOK.print();
        } else {
            resultFail.print();
        }
    }
}

void doMode(char * buffer, uint8_t length) {
    if (length!=3) {
        resultFail.print();
        return;
    }
    if (appliance.setMessageMode(buffer[2])) {
        resultOK.print();
    } else {
        resultFail.print();
    }
}

void processCommand(char * buffer, uint8_t length) {
    bool newLine = true;
    bool qm = false;

    // do something.
    if (WS12::commandId.equals(buffer,length)) {
        doId();
    } else if (WS12::commandSer.begins(buffer,length)) {
        doSer(buffer,length);
    } else if (length == 1) {
        switch(buffer[0]) {
            case 'g':
                doGet();
                break;
            default:
                qm = true;
        }
    } else if (length > 2 && buffer[1] == ' ') {
        switch(buffer[0]) {
            case 'v':
                doValves(buffer,length);
                break;
            case 'p':
                doPressure(buffer,length);
                break;
            case 'm':
                doMode(buffer,length);
                break;
            default:
                qm = true;
        }
    } else if (length==0) {
        newLine = false;
    } else {
        qm = true;
    }

    if (qm) {
        WS12::questionMarks.print();
    }

    if (newLine) {
        Serial.println();
    }

    WS12::stringPrompt.print();
}

void loop() {
    Pollable::pollAll();
    if (lineReader.isLineReady()) {
        char * buffer;
        uint8_t length;
        lineReader.getLine(buffer,length);
        processCommand(buffer,length);
    }
}