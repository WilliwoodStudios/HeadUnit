function wedgePassengerTemperature() {
	this.component = $ui.WedgeTemperature;
	
	this.direction = $ui.WedgeTemperature.RIGHT;
	
	this.backButton = {
		icon: 'emulator-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new $system.SystemEvent($system.EventType.ONPASSENGERTEMPCHANGE, {temperature: this.temperature});
		$core.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.setTemperature(data.temperature);
		}
	};
}