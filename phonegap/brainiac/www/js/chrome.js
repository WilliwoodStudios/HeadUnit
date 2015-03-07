function screenChrome() {
	this.disableAnimation = true;
	this.component = ws12.HeadUnitChrome;
	this.homeWindowPane = paneMenu;
	this.secondaryWindowPane = paneMediaPlayer;
	this.hvac = {
		visible: false,
		driver: {
			temperature: {
				value: 75,
				onclick: function() {
					ws12.push(wedgeDriverTemperature, {temperature: this.temperature})
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
					ws12.push(wedgePassengerTemperature, {temperature: this.temperature})
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
		
		//showDefrostOnBar: true
	};
	
	this.onshow = function() {
		if (true) {
			this.hvac.setVisible(true);
		}
	}
}