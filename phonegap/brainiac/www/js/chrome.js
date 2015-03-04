function screenChrome() {
	this.disableAnimation = true;
	this.component = ws12.HeadUnitChrome;
	this.home = paneMenu;
	
	this.hvac = {
		visible: false,
		driver: {
			temperature: 75,
			ontemperatureclick: function() {
				console.log('driver temp clicked');
				ws12.push(wedgeDriverTemperature, {temperature: this.temperature})
			}
		},
		passenger: {
			temperature: 73,
			ontemperatureclick: function() {
				console.log('passenger temp clicked');
			}
		},
		air: {
			showDefrost: false,
		}
		
		//showDefrostOnBar: true
	};
	
	this.onshow = function() {
		if (true) {
			this.hvac.setVisible(true);
		}
	}
}