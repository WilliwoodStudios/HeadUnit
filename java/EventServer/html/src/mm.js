console.log("Loading mm.js");

var _mm = new function() {

    self = this;



    _events.registerForEvent("B:SYS:MM:POS",function(sequenceNumber,type,payload) {
        self.processEvent(sequenceNumber,type,payload);
    });

    this.mCallback = null;
    this.mOnPositionChanged = null;

    this.play = function() {
        this.remoteCall("play");
    };

    this.stop = function() {
        this.remoteCall("stop");
    };

    this.pause = function() {
        this.remoteCall("pause");
    }

    this.resume = function() {
        this.remoteCall("resume");
    }

    this.getStatus = function() {
        this.remoteCall("getStatus");
    }

    this.seek = function(to) {
        this.remoteCall("seek?to=" + to);
    }

    this.processEvent = function(sequenceNumber,type,payload) {
        if (type == "B:SYS:MM:POS") {
            if (this.mOnPositionChanged != null) {
                try {
                    this.mOnPositionChanged(parseInt(payload));
                } catch (e) {
                    console.log("Bad position",e,payload);
                }
            }
        }
    }

    this.onPositionChanged = function(callback) {
        this.mOnPositionChanged = callback;
    }

    this.remoteCall = function(what) {
        var request = new XMLHttpRequest();
        var callback = this.mCallback;
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
        request.open("GET","/brainiac/service/mm/" + what,true);
        request.send();
    }

    this.onResult = function(callback) {
        this.mCallback = callback;
    }

}();