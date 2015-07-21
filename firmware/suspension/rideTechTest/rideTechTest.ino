uint8_t buffer[9];

void setup() {
    Serial.begin(9600);
    buffer[0] = 0xff;
    buffer[1] = 0x25;
    buffer[2] = 0x4f;
    for (uint8_t i = 3; i<9; ++i) {
        buffer[i] = 0xff;
    }
}

void loop() {
    uint8_t buffer[] = { 0,1,0x55,0xaa,254,255};
    while(true) {
        for (int i=0; i<255; ++i) {
            Serial.write(i);
            Serial.flush();
        }
    }
}

void loopOld() {
    uint8_t which = 3 + (rand() % 5);
    uint8_t toAdd = (rand() % 2) == 0 ? -1 : 1;
    buffer[which] += toAdd;
    if (buffer[which] < 32) {
        buffer[which] = 32;
    }
    if (buffer[which] > which * 10) {
        buffer[which] = which * 10;
    }
    // for (uint8_t i = 3; i<8; ++i) {
    //     buffer[i] = random();
    // }
    uint8_t total = 0;
    for (uint8_t i=1; i<8; ++i) {
        total += buffer[i];
    }
    total = 256 - total;

    buffer[8] = total;

    uint8_t total2 = 0;
    for (uint8_t i=1; i<8; ++i) {
        total2 += buffer[i];
    }
    total2 ^= 0xff;
    ++total2;

    if (total != total2) {
        Serial.print("Total == total2: ");
        Serial.println(total==total2);

        for (uint8_t i=0; i<9; ++i) {
            uint8_t next = buffer[i];
            if (next < 16) {
                Serial.print("0");
            }
            Serial.print(next,HEX);
            Serial.print(" ");
        }
        Serial.println();
        while(true) {
            Serial.write(buffer,9);
            Serial.flush();
        }
    }

    Serial.write(buffer,9);
    Serial.flush();
}