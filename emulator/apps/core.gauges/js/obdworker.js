var OBDWorker = function() {
    var worker = {};

    var listeners = {};

    var webSocket = null;

    var webSocketOpen = false;

    var onopen = function() {
        console.log("web socket open");
        webSocketOpen = true;
        for (modePid in listeners) {
            var mode = modePid >> 16;
            var pid = modePid & 0xffff;
            var message = { action: "register", mode: mode, pid: pid};
            webSocket.send(JSON.stringify(message));
        }
    }.$bind(worker);

    var onerror = function() {
        webSocketOpen = false;
        console.log("web socket error");
    }.$bind(worker);

    var onclose = function() {
        webSocketOpen = false;
        console.log("web socket closed");
    }.$bind(worker);

    var onmessage = function(a,b,c) {
        // console.log("Web socket message " + a + " " + b + " " + c);
        if (typeof(a)==="string") {
            if (a.indexOf("==")==0) {
                parts = a.split(",");
                // String toSend = String.format("==pidUpdate,%d,%d,%s",pid >> 16, pid & 0xffff,value);
                if (parts[0] === "==pidUpdate") {
                    var mode = parseInt(parts[1]);
                    var pid = parseInt(parts[2]);
                    var payload = parts[3];
                    var bytes = $system.util.hexStringToIntArray(payload);
                    var toCall = listeners[mode << 16 | pid];
                    if (toCall === undefined || toCall.length == 0) {
                        console.log("No body cares...");
                        // TODO - ensure we're not going to keep hearing this message... ???
                    }
                    if (bytes.length <= 2) {
                        console.log("response too short",payload);
                        // TODO - call error callback
                        return;
                    }

                    if (bytes[1] != pid) {
                        console.log("response PID doesn't make sense",payload);
                        // TODO - call error callback
                        return;
                    }

                    var value = undefined;

                    if (mode == 1) {
                        if (pid == 0xd) {
                            // Vehicle Speed
                            value = bytes[2];
                        } else if (pid == 0xc) {
                            // Vehicle RPM
                            value = bytes[2] << 8 | bytes[1];
                            value /= 4;
                        } else if (pid == 0xe) {
                            // Timing Advance
                            value = (bytes[2] - 128) / 2;
                        } else if (pid == 0xf || pid == 0x5c) {
                            // Air Intake Temperature
                            // Engine Oil Temperature
                            value = bytes[2] - 40;
                        } else if (pid == 0x11) {
                            // Throttle position
                            value = bytes[2] * 100 / 255;
                        }
                    }

                    if (value !== undefined) {
                        value = Math.round(value);
                        for (var i=0; i<toCall.length; ++i) {
                            toCall[i].callback(value);
                        }
                    }
                }
            }
        }
    }.$bind(worker);

    // window.setInterval(function() {
    //     onmessage("==pidUpdate,1,12,41 0c 12 34");
    //     onmessage("==pidUpdate,1,13,41 0d a0");
    // },1000);

    worker.register = function(mode,pid,callback,error) {
        console.log("Registering",mode,pid);
        if (listeners[mode << 16 | pid]===undefined) {
            console.log("Creating array");
            listeners[mode << 16 | pid] = [];
            if (webSocket==null) {
                console.log("Creating web socket");
                webSocket = $system.util.wrapWebSocket("/brainiac/service/hardware/obd");
                webSocket.onopen = onopen;
                webSocket.onerror = onerror;
                webSocket.onmessage = onmessage;
                webSocket.onclose = onclose;
                webSocket.start();
            }
            if (webSocketOpen) {
                console.log("websocket already open");
                registerForPid(mode,pid);
            }
        }
        var listener = { callback: callback, error: error };
        listeners[mode << 16 | pid].push(listener);
        console.log("register done");
    }.$bind(worker);

    worker.unregister = function(mode,pid,callback,error) {
        if (listeners[pid]===undefined) {
            return;
        }
        for (var i=0; i<listeners[pid].length; ++i) {
            if (listeners[pid].callback === callback) {
                listeners.splice(i,1);
                --i;
            }
        }
        if (listeners[pid].length==0) {
            // TODO - unregister with the OBD message handler
        }
    }.$bind(worker);

    return worker;
}();

/*
speed

rpm
timing advance

intame air

throttle pos
engine oil temp

oxygen
*/