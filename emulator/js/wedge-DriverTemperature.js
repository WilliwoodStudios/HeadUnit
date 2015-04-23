function wedgeDriverTemperature() {
	this.component = $ui.WedgeTemperature;
	
	this.direction = $ui.WedgeTemperature.Direction.LEFT;
	
	this.backButton = {
		icon: 'emulator-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new $core.SystemEvent($system.EventType.ONDRIVERTEMPCHANGE, {temperature: this.temperature});
		$core.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.setTemperature(data.temperature);
		}
	};
}