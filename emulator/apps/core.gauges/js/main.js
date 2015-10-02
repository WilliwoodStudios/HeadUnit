/* Copyright (c) 2015 Workshop 12 Inc. */

function emulator_Gauge(object, screen) {
	$ui_CoreComponent.call(this,object,screen);

	console.log("Elephant");

	object.dom.innerHTML = "Robbie";

	object.dom.style.width = "200px";
	object.dom.style.height = "200px";
	object.dom.style.border = "1px solid red";
	object.dom.style.color = "#ffffff";

	object.update = function(value) {
		object.dom.innerHTML = value;
	}.$bind(object);

	return object.dom;
}

$ui.addExtension(new UIExtension('Gauge', emulator_Gauge));

function main() {
	this.component = $ui.WindowPane;

	this._private = {};
	
	this.content = [
		{
			component: $ui.Gauge,
		}, {
			component: $ui.Gauge,
		}
	];

	this._private.onopen = function() {
		var toSend = { 
			action: "register", 
			"mode": 1, 
			"pid": 0xc 
		};
		this._private.wrappedWebSocket.send(JSON.stringify(toSend));
		toSend.pid = 0xd;
		this._private.wrappedWebSocket.send(JSON.stringify(toSend));
	}.$bind(this);

	this._private.onmessage = function(message) {
		console.log(message);
		console.log(JSON.stringify(message));
		if (message[0] === '=') {
			var parts = message.substring(2).split(",");
			if (parts[0] === 'pidUpdate') {
				var mode = parseInt(parts[1]);
				var pid = parseInt(parts[2]);
				var value = parts[3];

				var asArray = $system.util.hexStringToIntArray(value);

				if (mode == 1) {
					switch(pid) {
						case 0xd:
							this.content[0].update(asArray[asArray.length-1] + " km/h");
							break;
						case 0xc:
							var rpm = asArray[asArray.length-2] * 256 + asArray[asArray.length-1];
							rpm /= 4;
							rpm = Math.floor(rpm);
							this.content[1].update(rpm + " RPM");
							break;
						default:
							console.log("Unhandled " + mode + " " + pid);
					}
				}
				console.log("Mode: " + mode + " PID: " + pid + " " + value + JSON.stringify(asArray));
			}
		}
	}.$bind(this);
	
	this.onshow = function() {
        this._private.wrappedWebSocket = $system.util.wrapWebSocket("/brainiac/service/hardware/obd");
        this._private.wrappedWebSocket.onmessage = this._private.onmessage;
        this._private.wrappedWebSocket.onopen = this._private.onopen;
        this._private.wrappedWebSocket.start();
	}
}