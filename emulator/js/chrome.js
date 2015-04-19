function screenChrome() {
	this.disableAnimation = true;
	this.component = $ui.HeadUnitChrome;
	this.homeWindowPane = mainMenu;
	//this.secondaryWindowPane = 'core.media.player';
	this.hvac = {
		visible: true,
		driver: {
			temperature: {
				value: 75,
				onclick: function() {
					$ui.push(wedgeDriverTemperature, {temperature: this.value})
				}
			},
			seat: {
				level: 0,
				maxLevel: 1,
				onclick: function() {
					console.log('driver seat level: ' + this.level);
				}
			}
		},
		passenger: {
			temperature: {
				value: 73,
				onclick: function() {
					$ui.push(wedgePassengerTemperature, {temperature: this.value})
				}
			},
			seat: {
				level: 0,
				maxLevel: 1,
				onclick: function() {
					console.log('passenger seat level: ' + this.level);
				}
			}
		},
		fans: {
			onclick: function() {
				console.log('fans click');
			}
		}
		//showDefrostOnBar: true
	};
	
	this.onshow = function() {
		if (this.hvac) {
			// Set our temperature change listeners
			$system.addEventListener($system.EventType.ONDRIVERTEMPCHANGE, this.ondrivertempchange, this);
			$system.addEventListener($system.EventType.ONPASSENGERTEMPCHANGE, this.onpassengertempchange, this);
		}
	}
	
	// Update the driver temperature setting
	this.ondrivertempchange = function(data) {
		this.hvac.driver.temperature.setTemperature(data.temperature);
	}
	this.ondrivertempchange = this.ondrivertempchange.bind(this);
	
	// Update the passenger temperature setting
	this.onpassengertempchange = function(data) {
		this.hvac.passenger.temperature.setTemperature(data.temperature);
	}
	this.onpassengertempchange = this.onpassengertempchange.bind(this);
}