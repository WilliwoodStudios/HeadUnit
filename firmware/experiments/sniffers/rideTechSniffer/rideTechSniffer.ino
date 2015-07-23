#include "message.h"

MessageList messageList;

void setup() {
    messageList.randomize();
    messageList.dump();
}

void loop() {
    // messageList.addMessage(6,14);
}