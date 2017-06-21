#include <Arduino.h>

#include "constants.h"

const char _product_details[] PROGMEM = "rideTech suspension 1.0.0.0 ";
const PStr productDetails(_product_details);

const char _result_ok[] PROGMEM = "OK";
const PStr resultOK(_result_ok);

const char _result_fail[] PROGMEM = "FAIL";
const PStr resultFail(_result_fail);

const char _string_help[] PROGMEM = "id - get device id\n"\
                                    "g - get the current pressures\n"\
                                    "    returns [<fl>,<fr>,<rl>,<rr>,<tank>]\n"\
                                    "p <fl>,<fr>,<rl>,<rr> - seek to the given pressures\n" \
                                    "v <valves> - set the valve positions - valves is in HEX\n" \
                                    "s <n> - go to preset n\n"\
                                    "m r|R|s|S - set the message mode\n"\
                                    "? - display this help\n";
const PStr stringHelp(_string_help);