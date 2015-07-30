#include "message.h"
#include <SoftwareSerial.h>

SoftwareSerial soft(11,12); // NB: this is for sniffing. 12 is unused. 10,11 is for a real transmitter.
MessageList messageList;

void setup() {
    soft.begin(9600);
    Serial.begin(9600);
    Serial.println("p to print the current message counts");
    // messageList.randomize();
    messageList.dump();
}

uint8_t state = 0;

uint8_t partA = 0;
uint8_t partB = 0;

uint8_t huntA = 0x11;
uint8_t huntB = 0;

uint8_t buffer[20];
uint8_t bufferOffset = 0;

bool capture = false;

void loop() {
    while(soft.available()) {
        uint8_t next = soft.read();
        if (next == 0xff) {
            if (capture) {
                capture = false;
                Serial.print("Captured: FF ");
                Serial.print(partA,HEX);
                Serial.print(" ");
                Serial.print(partB,HEX);
                Serial.print(" ");
                for (uint8_t i = 0; i<bufferOffset; ++i) {
                    Serial.print(buffer[i],HEX);
                    Serial.print(" ");
                }
                Serial.println();
            }
            state = 1;
        } else {
            switch (state) {
                case 0:
                    if (capture) {
                            buffer[bufferOffset++] = next;
                            bufferOffset %= 20;
                    }
                    break;
                case 1:
                    partA = next;
                    ++state;
                    break;
                case 2:
                    partB = next;
                    messageList.addMessage(partA,partB);
                    if (partA == huntA && partB == huntB) {
                        Serial.println("Capturing");
                        capture = true;
                        bufferOffset = 0;
                    }
                    state=0;
                    break;
                default:
                    Serial.println("Should not be here...");
            }
        }
    }
    while(Serial.available()) {
        uint8_t next = Serial.read();
        if (next=='p') {
            messageList.dump();
        }
    }
}