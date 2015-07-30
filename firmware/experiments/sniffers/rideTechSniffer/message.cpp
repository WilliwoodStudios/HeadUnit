#include "message.h"

void MessageList::addMessage(uint8_t a, uint8_t b) {
    uint8_t minPosition = 0;
    int32_t minCount = messages[0].getCount();
    uint8_t use = 0xff;
    
    for (uint8_t i=0; i<MESSAGE_LIST_SIZE; ++i) {
        if (messages[i].getA() == a && messages[i].getB() == b) {
            ++messages[i];
            return;
        }
    }
    for (uint8_t i=0; i<MESSAGE_LIST_SIZE; ++i) {
        if (messages[i].getCount()==-1) {
            minPosition = i;
            minCount = messages[i].getCount();
            break;
        }
        if (messages[i].getCount() < minCount) {
            minPosition = i;
            minCount = messages[i].getCount();
        }
    }

    messages[minPosition].setMessage(a,b);
    ++messages[minPosition];
}

void MessageList::sort() {
    Message temp;
    for (uint8_t i=0; i<MESSAGE_LIST_SIZE; ++i) {
        for (uint8_t j=i+1; j<MESSAGE_LIST_SIZE; ++j) {
            if (messages[i] > messages[j]) {
                temp = messages[i];
                messages[i] = messages[j];
                messages[j] = temp;
            }
        }
    }
}


void MessageList::dump() {
    sort();
    Serial.println("=====");
    for (uint8_t i=0; i<MESSAGE_LIST_SIZE; ++i) {
        if (messages[i].getCount() < 0) {
            // ignore
        } else {
            messages[i].dump();
        }
    }
}

void MessageList::randomize() {
    for (uint8_t i=0; i<20; ++i) {
        addMessage(random(),random());
    }

    for (uint8_t i=0; i<150; ++i) {
        ++messages[random() % MESSAGE_LIST_SIZE];
    }
}