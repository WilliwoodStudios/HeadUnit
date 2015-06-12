/* Copyright (c) 2015 Workshop 12 Inc. */
function wedgeDriverTemperature() {
	this.component = $ui.WedgeTemperature;
	
	this.direction = $ui.WedgeTemperature.Direction.LEFT;
	
	this.backButton = {
		icon: 'emulator-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new $ui.DataEvent($system.EventType.ONDRIVERTEMPCHANGE, {temperature: this.temperature});
		$core.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.setTemperature(data.temperature);
		}
	};
}