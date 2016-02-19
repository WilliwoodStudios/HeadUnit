import sys

if len(sys.argv) < 2:
    print "Usage:",sys.argv[0],"<fileToValidate...>"
    exit(1)

for filename in sys.argv[1:]:
    print filename
    print "================================"

    file = open(filename)
    content = file.read()
    file.close()

    lines = content.split()

    for line in lines:
        if line.find("fa") == 0:
            total = 0
            for i in xrange(0,len(line)/2-1):
                part = line[i*2:(i+1)*2]
                total += int(part,16)

            if total % 256 != 0:
                print total % 256, total, total/256.0, line
