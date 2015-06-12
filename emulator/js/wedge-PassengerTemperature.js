/* Copyright (c) 2015 Workshop 12 Inc. */
function wedgePassengerTemperature() {
	this.component = $ui.WedgeTemperature;
	
	this.direction = $ui.WedgeTemperature.Direction.RIGHT;
	
	this.backButton = {
		icon: 'emulator-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new $ui.DataEvent($system.EventType.ONPASSENGERTEMPCHANGE, {temperature: this.temperature});
		$core.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.setTemperature(data.temperature);
		}
	};
}