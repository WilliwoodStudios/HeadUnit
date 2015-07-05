#include "global.h"

#include "StatementParser.h"
#include "LineReader.h"
#include "Blinky.h"

#include "Strings.h"
#include "SerialNumber.h"

Blinky blinky(13, 500);
LineReader lineReader;

Pollable * pollables[10];
uint8_t pollablesOffset = 0;

RelayChannel switchChannels[SWITCH_CHANNEL_COUNT];
PolarisedChannel directedChannels[DIRECTED_CHANNEL_COUNT];

void doId() {
  product_details.print();
  SerialNumber::print();
}

void doEnum() {
  Serial.print('s');
  Serial.print(':');
  Serial.print(SWITCH_CHANNEL_COUNT);
  Serial.print(',');
  Serial.print(' ');
  Serial.print('d');
  Serial.print(':');
  Serial.print(DIRECTED_CHANNEL_COUNT);
}

void doSet(char * command, int length) {
  for (uint8_t i = 0; i < SWITCH_CHANNEL_COUNT; ++i) {
    switchChannels[i].showSet(i);
  }
  for (uint8_t i = 0; i < DIRECTED_CHANNEL_COUNT; ++i) {
    directedChannels[i].showSet(i);
  }
}

void doSer(char * command, int length) {
  if (length != 20) {
    error_serUsage.print();
  } else {
    SerialNumber::store(command + 4, length - 4);
    doId();
  }
}


void addPollable(Pollable * pollable) {
  if (pollablesOffset < sizeof(pollables) / sizeof(pollable)) {
    pollables[pollablesOffset++] = pollable;
  } else {
    error_pollables.println();
  }
}

void setup() {
  for (uint8_t i = 0; i < sizeof(pollables) / sizeof(Pollable*); ++i) {
    pollables[i] = NULL;
  }

  Serial.begin(9600);
  addPollable(&blinky);
  addPollable(&lineReader);

  directedChannels[0].setPins(4, 5);
  directedChannels[1].setPins(6, 7);
  directedChannels[2].setPins(8, 9);
  directedChannels[3].setPins(10, 11);

  switchChannels[0].setPin(12);
  switchChannels[1].setPin(13);
  switchChannels[2].setPin(14);
  switchChannels[3].setPin(15);

  for (uint8_t i = 0; i < 4; ++i) {
    addPollable(&directedChannels[i]);
    addPollable(&switchChannels[i]);
  }

  for (uint8_t i = 0; i < 5; ++i) {
    string_prompt.println();
  }
}

StatementParser statementParser;

void processCommand(char * buffer, uint8_t length) {
  bool newLine = true;
  if (command_id.equals(buffer, length)) {
    doId();
  } else if (command_enum.equals(buffer, length)) {
    doEnum();
  } else if (command_ser.begins(buffer, length)) {
    doSer(buffer, length);
  } else if (command_set.begins(buffer, length)) {
    doSet(buffer, length);
    newLine = false;
  } else if (length > 2 && buffer[1] == ':' && (buffer[0] == 's' || buffer[0] == 'd' || buffer[0] == 'p')) {
    if (statementParser.doStatement(buffer, length)) {
      Serial.print("OK");
    } else {
      Serial.print("FAIL");
    }
  } else if (length == 0) {
    // do nothing.
    newLine = false;
  } else {
    Serial.print("???");
  }
  if (newLine) {
    Serial.println();
  }
  string_prompt.print();
}

void loop() {
  uint32_t now = millis();

  for (uint8_t i = 0; i < pollablesOffset; ++i) {
    pollables[i]->poll(now);
  }

  if (lineReader.isLineReady()) {
    char * buffer;
    uint8_t length;
    lineReader.getLine(buffer, length);
    processCommand(buffer, length);
  }
}






