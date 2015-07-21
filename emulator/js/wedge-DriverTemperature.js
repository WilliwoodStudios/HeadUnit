/* Copyright (c) 2015 Workshop 12 Inc. */
function wedgeDriverTemperature() {
	this.component = $ui.WedgeNumber;
	this.min = 60;
	this.max = 80;
	this.direction = $ui.WedgeNumber.Direction.LEFT;
	
	this.backButton = {
		icon: 'img/temperature.png',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new $ui.DataEvent($system.EventType.ONDRIVERTEMPCHANGE, {temperature: this.value});
		$core.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.value = data.temperature;
		}
	};
}