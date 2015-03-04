function wedgeDriverTemperature() {
	this.component = ws12.WedgeTemperature;
	
	
	this.onshow = function(data) {
		//console.log('Driver temperature:' + data.temperature);
	}
}