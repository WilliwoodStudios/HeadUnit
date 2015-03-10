function wedgePassengerTemperature() {
	this.component = ws12.WedgeTemperature;
	
	this.direction = ws12.WedgeScreen.RIGHT;
	
	this.backButton = {
		icon: 'ws12-icon-head-unit-temperature',
		caption: 'Done'
	};
	
	this.onshow = function(data) {
		//console.log('Driver temperature:' + data.temperature);
	}
}