/* Copyright (c) 2015 Workshop 12 Inc. */
function wedgeSuspension() {
	this.component = $ui.WedgeNumber;
	this.min = 0;
	
	this.direction = $ui.WedgeNumber.Direction.RIGHT;
	
	this.backButton = {
		icon: 'img/suspension.png',
		caption: 'Done'
	};
	
	this.onchange = function() {
		//var systemEvent = new $ui.DataEvent($system.EventType.ONPASSENGERTEMPCHANGE, {temperature: this.temperature});
		//$core.raiseEvent(systemEvent);
	};
	
	// Adjust the direction of the screen
	this.oncreate = function(data) {
		if (data && data.corner) {
			if (data.corner[0] == 'l') {
				this.direction = $ui.WedgeNumber.Direction.LEFT;
			}
		}
	};
	
	// Retrieve our corner pressure
	this.onshow = function(data) {
		if (data && data.corner) {
			//this.setTemperature(data.temperature);
		}
	};
}