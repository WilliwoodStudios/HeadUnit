function wedgeDriverTemperature() {
	this.component = $ui.WedgeTemperature;
	
	this.direction = $ui.WedgeTemperature.LEFT;
	
	this.backButton = {
		icon: 'emulator-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new $system.SystemEvent($system.EventType.ONDRIVERTEMPCHANGE, {temperature: this.temperature});
		$emulator.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.setTemperature(data.temperature);
		}
	};
}