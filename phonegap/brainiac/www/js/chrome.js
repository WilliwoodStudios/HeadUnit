function screenChrome() {
	this.disableAnimation = true;
	this.component = ws12.HeadUnitChrome;
	this.homeWindowPane = 'apps/core.mainmenu/index.html';
	this.secondaryWindowPane = paneMediaPlayer;
	this.hvac = {
		visible: true,
		driver: {
			temperature: {
				value: 75,
				onclick: function() {
					ws12.push(wedgeDriverTemperature, {temperature: this.value})
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
					ws12.push(wedgePassengerTemperature, {temperature: this.value})
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
			value: ws12.Fans.AUTO,
			onclick: function() {
				console.log('fans click');
			}
		}
		//showDefrostOnBar: true
	};
	
	this.onshow = function() {
		if (window.innerHeight > 700) {
			// Set our temperature change listeners
			ws12.eventBroker.addEventListener(ws12.EventType.ONDRIVERTEMPCHANGE, this.ondrivertempchange, this);
			ws12.eventBroker.addEventListener(ws12.EventType.ONPASSENGERTEMPCHANGE, this.onpassengertempchange, this);
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