#!/usr/bin/python

import os
import hashlib
import urllib
import urllib2
import sys

allHashes = {}
webNames = {}
currentHashes = {}

def readOldHashes():
    global allHashes
    global webNames
    allHashes.clear()
    try:
        file = open(".sync.hashes","r")
        content = file.read()
        file.close()
        lines = content.split("\n")
        for line in lines:
            if len(line) > 65:
                parts = line.split("|")
                allHashes[parts[0]] = parts[1]
                webNames[parts[0]] = parts[2]
    except:
        pass
        # print "Exception..."

def saveHashes():
    global currentHashes
    file = open(".sync.hashes","w")
    toWrite = ""
    for key in currentHashes.keys():
        toWrite = toWrite + key + "|" + currentHashes[key] + "|" + webNames[key] + "\n"
    file.write(toWrite)
    file.close()

def hashFile(filePath):
    file = open(filePath,"rb")
    content = file.read()
    file.close()
    return hashlib.sha256(content).hexdigest()


def handle(webPath,filePath):
    children = os.listdir(filePath)
    for child in children:
        fullName = filePath + "/" + child
        if os.path.isdir(fullName):
            # print "/",fullName
            handle(webPath + child + "/",fullName)

    for child in children:
        fullName = filePath + "/" + child
        if not os.path.isdir(fullName):
            global currentHashes
            currentHashes[fullName] = hashFile(fullName)
            webNames[fullName] = webPath + child
            # print currentHashes[fullName],fullName

if len(sys.argv)!=2:
    print "Usage:",sys.argv[0],"<host>"
    exit(-1)

url = "http://%s:9000/brainiac/content/" % sys.argv[1]

readOldHashes()
handle("/","emulator")

anyChanged = False

# Check for DELETED files.
for oldFile in allHashes.keys():
    if not oldFile in currentHashes:
        toHit = url + "delete?path=" + urllib.quote(webNames[oldFile])
        response = urllib2.urlopen(toHit).read()
        anyChanged = True
        print "Deleted:",oldFile,response

# Check for modified files.
for someFile in currentHashes.keys():
    update = False
    message = ""
    if not someFile in allHashes:
        update = True
        message = "New"
    elif currentHashes[someFile] != allHashes[someFile]:
        update = True
        message = "Modified"

    if update:
        anyChanged = True
        toHit = url + "update?path=" + urllib.quote(webNames[someFile])
        file = open(someFile,"rb")
        data = file.read()
        file.close()
        response = urllib2.urlopen(toHit,data).read()
        print message,someFile

if anyChanged:
    saveHashes()
else:
    print "No files have been changed."
