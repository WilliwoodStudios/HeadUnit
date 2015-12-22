import serial
import time

ser = serial.Serial('/dev/cu.usbmodem1411',115200)

lineBuffer = range(0,32)
lineOffset = 0
lineFrom = -1
lineLastByteTime = 0
lineFirstByteTime = 0

def flushLine():
    global lineBuffer
    global lineOffset
    global lineFrom
    global lineFirstByteTime

    if lineOffset == 0:
        return

    message = ""

    when = lineFirstByteTime
    when = when % 86400
    hours = int(when) / 3600
    minutes = (int(when) / 60) % 60
    seconds = (int(when)) % 60
    frac = int((when - int(when)) * 1000)

    message = "%02d:%02d:%02d.%03d: " % (hours, minutes, seconds, frac)


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
    lineFirstByteTime = 0

while True:
    a = 0
    while a < 128:
        a = ord(ser.read(1))

    byte = ser.read(2)

    val = ord(byte[0])<<4 | ord(byte[1])

    a = a - 128

    if a != lineFrom:
        flushLine()

    if val == 0xfa:
        flushLine()

    now = time.time()

    if lineFirstByteTime == 0:
        lineFirstByteTime = now

    # if lineOffset > 0 and now - lineLastByteTime > 0.5:
    #     flushLine()

    lineLastByteTime = now
    lineFrom = a
    lineBuffer[lineOffset] = val
    lineOffset = lineOffset + 1

    if lineOffset == 32:
        flushLine()



