console.log("Loading obd.js");

var _obd = new function() {

    self = this;

    function stringToIntArray(line) {
        console.log("Converting " + line);
        console.log("Length " + line.length);

        // TODO - need a better strategy for multi line large responses.
        // Filter out multi line responses (for now)
        var lastCR = line.lastIndexOf("\r");
        if (lastCR != -1) {
            line = line.substring(lastCR+1);
        }

        var toReturn = Array();
        var nextInt = 0;
        var state = 0;
        for (var i=0; i<line.length; ++i) {
            nextInt <<= 4;

            var code = line.charCodeAt(i);
            if (code >= 0x30 && code <= 0x39) {
                nextInt |= code-0x30;
                ++state;
            } else if (code >= 65 && code <= 70) {
                nextInt |= code - 65 + 10;
                ++state;
            } else if (code >= 97 && code <= 102) {
                nextInt |= code - 97 + 10;
                ++state;
            }

            if (state==2) {
                toReturn.push(nextInt);
                state = 0;
                nextInt = 0;
            }
        }
        console.log("Returning " + JSON.stringify(toReturn));
        return toReturn;
    }

    console.log(stringToIntArray("cafe babe"));

    function remoteCall(callback, what) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            console.log(request.readyState + " " + request.status);
            if (request.readyState == 4) {
                var status = request.status;
                var error = null;
                if (status != 200) {
                    error = request.statusText;
                }
                var response = request.responseText;
                var responseObject = response;
                try {
                    responseObject = JSON.parse(response);

                    if ("obd" in responseObject) {
                        console.log("ODB is in response");
                        var obd = responseObject.obd;
                        if ("response" in obd) {
                            console.log("response is in obd");
                            obd["responseBytes"] = stringToIntArray(obd.response);
                        }
                    }

                    if ("error" in responseObject) {
                        error = responseObject.error;
                    }
                } catch (e) {
                    // ignore.
                }

                console.log("Status: " + status);
                console.log("Error: " + error);
                console.log("Response text: " + response);

                if (callback != null) {
                    callback(error,responseObject);
                }
            }
        };
        request.open("GET","/brainiac/service/hardware/obd/" + what,true);
        request.send();
    }

    this.getStatus = function(callback) {
        remoteCall(callback,"getStatus");
    }

    this.sendPID = function(callback, mode, pid) {
        try {
            mode = parseInt(mode);
            pid = parseInt(pid);
            remoteCall(callback,"sendPID?mode="+mode+"&pid="+pid);
        } catch (e) {
            callback(e,null);
        }
    }

    this.getDTC = function(callback) {
        remoteCall(callback,"getDTC");
    }

}();