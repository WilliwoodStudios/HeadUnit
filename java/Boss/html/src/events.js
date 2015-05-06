console.log("Loading events.js");

var _events = new function() {

    var _impl = new function() {
        /**
         * Create a random id 20 chars long.
         */
         this.randomId = function() {
            var toReturn = "";
            var sampleSet = "0123456789abcdefghijklmnopqrstuvwxyz";

            for (var i=0; i<20; ++i) {
                var which = Math.floor(Math.random() * sampleSet.length);
                toReturn += sampleSet.substring(which,which+1);
            }

            return toReturn;
        }

        this.mId = this.randomId();
        this.mServerConnections = [];
        this.mTypeCallbackMapping = {};

        this.enableEvents = function() {
            console.log("Enabling events.");
            for (var i=0; i<5; ++i) {
                this.connectToServer();
            }
        };

        this.processEvents = function(connection) {
            if (connection.status == 200) {
                var events = connection.responseText.split("\n");
                for (var i=0; i<events.length; ++i) {
                    var event = events[i].split("|");
                    if (event == null || event.length < 3) {
                        continue;
                    }
                    var sequenceNumber = event[0];
                    var type = event[1];
                    var payload = event[2];
                    if (type in this.mTypeCallbackMapping) {
                        this.mTypeCallbackMapping[type](sequenceNumber,type,payload);
                    }
                }
            }

            this.connectToServer();
        };

        this.removeConnection = function(connection) {
            var where = this.mServerConnections.indexOf(connection);
            if (where != -1) {
                this.mServerConnections.splice(where,1);
            } else {
                console.log("Attempted to remove missing connection.");
            }
        }

        this.connectToServer = function() {
            // TODO initial error handling.
            // TODO retry error handling.
            var connection = new XMLHttpRequest();
            var self = this;
            connection.onreadystatechange = function() {
                if (connection.readyState == 4) {
                    self.removeConnection(connection);
                    self.processEvents(connection);
                }
            };

            var now = new Date().getTime();

            this.mServerConnections.push(connection);

            connection.open("GET","/brainiac/events/listen?id=" + this.mId,true);
            connection.send();
        };

        this.registerForEvent = function(type,callback) {
            console.log("Going to register for " + type);
            this.remoteCall("addListener?id="+this.mId+"&eventType=" + type);
            this.mTypeCallbackMapping[type] = callback;
        };

        this.remoteCall = function(what) {
        var request = new XMLHttpRequest();
        var callback = this.mCallback;
        request.onreadystatechange = function() {
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

                if (callback != null) {
                    callback(error,responseObject);
                }
            }
        };
        request.open("GET","/brainiac/events/" + what,true);
        request.send();
    }

    };


    this.enableEvents = function() {
        _impl.enableEvents();
    };

    this.registerForEvent = function(type,callback) {
        _impl.registerForEvent(type,callback);
    };

}();