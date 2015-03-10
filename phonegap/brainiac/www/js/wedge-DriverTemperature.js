function wedgeDriverTemperature() {
	this.component = ws12.WedgeTemperature;
	
	this.direction = ws12.WedgeScreen.LEFT;
	
	this.backButton = {
		icon: 'ws12-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onchange = function() {
		var systemEvent = new SystemEvent(ws12.EventType.ONDRIVERTEMPCHANGE, {temperature: this.temperature});
		ws12.eventBroker.raiseEvent(systemEvent);
	};
	
	this.onshow = function(data) {
		if (data && data.temperature) {
			this.setTemperature(data.temperature);
		}
	};
}