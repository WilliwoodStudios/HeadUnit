void setup() {
    Serial.begin(9600);

    cli();

    pinMode(2, INPUT);
    pinMode(13, OUTPUT);
    pinMode(3, OUTPUT);
    pinMode(4, OUTPUT);

    digitalWrite(3, LOW);

    EIMSK |= (1 << INT0);     // Enable external interrupt INT0
    EICRA |= (1 << ISC01);    // Trigger INT0 on falling edge

    TCCR2A = (1 << WGM21);   // CTC mode
    // TCCR2B = (1 << CS22) | (1 << CS20); // 128x prescalar
    TCCR2B = (1 << CS21) | (1 << CS20); // 32x prescalar
    // TCCR2B  =               (1 << CS20); // no prescalar
    TCCR2B = (1 << CS21); // 8x 

    // OCR2A = 12;
    OCR2A = 207;

    TIMSK2 |= (1 << OCIE2A); // Done below...

    sei();
}

uint8_t buffer[16];
uint8_t bufferNextWrite = 0;
uint8_t bufferLength = 0;

uint8_t mode = 0;
uint8_t byteInProgress = 0;

uint32_t count = 0;
uint32_t compa = 0;

bool reading = false;

uint8_t clockNext[] = { 207,207,207 };
uint8_t clockNextOffset = 0;

bool toggle = false;

ISR(TIMER2_COMPA_vect) {
    OCR2A = clockNext[clockNextOffset++];
    clockNextOffset %= 3;
    uint8_t current = (PIND & (1<<PIND2))!=0;
    if (current) {
        PORTD |= (1<<PORTD4);
    } else {
        PORTD &= ~(1<<PORTD4);
    }
    if (mode == 0) {
            if (current==0) {
                mode = 1;
                byteInProgress = 0;
            }
    } else if (mode < 9) {
        byteInProgress <<= 1;
        byteInProgress |= current^1;
        ++mode;
    } else {
        // if (current==1) {
            buffer[bufferNextWrite] = byteInProgress;
            ++bufferNextWrite;
            bufferNextWrite %= 16;
            if (bufferLength < 16) {
                ++bufferLength;
            }
        // }
        mode = 0;
        reading = false;
        TIMSK2 = 0;
    }

    toggle  = mode != 0;
    if (toggle) {
        PORTD |= (1<<PORTD3);
    } else {
        PORTD &= ~(1<<PORTD3);
    }
}

ISR(INT0_vect)
{
    if (reading) {
        // do nothing.
    } else {
        TCNT2 = 100;
        TIMSK2 = (1 << OCIE2A);
        reading = true;
    }
}


void loop() {
    bool good = false;
    uint8_t val = 0;
    // cli();
    if (bufferLength != 0) {
        good = true;
        val = buffer[(32 + bufferNextWrite - bufferLength) % 16];
        --bufferLength;
    }
    // sei();

    if (good) {
        Serial.println(val,HEX);
    }
}