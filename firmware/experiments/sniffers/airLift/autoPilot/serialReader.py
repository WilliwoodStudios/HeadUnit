import serial
import time

ser = serial.Serial('/dev/cu.usbmodem1411',115200)

lineBuffer = range(0,16)
lineOffset = 0
lineFrom = -1
lineLastByteTime = 0

def flushLine():
    global lineBuffer
    global lineOffset
    global lineFrom

    if lineOffset == 0:
        return

    message = ""

    if lineFrom == 0:
        message = message + "> "
    elif lineFrom == 1:
        message = message + "< "
    else:
        message = message + "- "    

    for x in xrange(0,lineOffset):
        message = message + ("%02x" % lineBuffer[x])

    print message



    lineOffset = 0

while True:
    a = 0
    while a < 128:
        a = ord(ser.read(1))

    byte = ser.read(2)

    val = ord(byte[0])<<4 | ord(byte[1])

    a = a - 128

    if a != lineFrom:
        flushLine()

    now = time.time()

    if lineOffset > 0 and now - lineLastByteTime > 0.1:
        flushLine()

    lineLastByteTime = now
    lineFrom = a
    lineBuffer[lineOffset] = val
    lineOffset = lineOffset + 1

    if lineOffset == 16:
        flushLine()



