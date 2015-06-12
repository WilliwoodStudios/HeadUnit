/* Copyright (c) 2015 Workshop 12 Inc. */
function screenChrome() {
	this.disableAnimation = true;
	this.component = $ui.HeadUnitChrome;
	this.primaryWindow ={
		windowPane: mainMenu
	};
	
	this.secondaryWindow = {
		manifest: {
			id: 'core.media.player',
			name: 'music',
			icon: 'img/icon-128x128.png',
			iconSplash: 'img/icon-256x256.png',
			content: 'index.html',
			availability: {
		        headUnit: true,
		        driversDevice: true
		    }
		}
	};
	
	this.hvac = {
		visible: (window.innerHeight > 600),
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
				$ui.push(popupHvac);
			}
		}
		//showDefrostOnBar: true
	};
	
	this.onshow = function() {
		if (this.hvac) {
			// Set our temperature change listeners
			$ui.addEventListener($system.EventType.ONDRIVERTEMPCHANGE, this.ondrivertempchange, this);
			$ui.addEventListener($system.EventType.ONPASSENGERTEMPCHANGE, this.onpassengertempchange, this);
		}
	}
	
	this.onsettingsclick = function() {
		$core.openSettings();
	}
	
	// Update the driver temperature setting
	this.ondrivertempchange = function(event) {
		this.hvac.driver.temperature.setTemperature(event.data.temperature);
	}.$bind(this);
	
	// Update the passenger temperature setting
	this.onpassengertempchange = function(event) {
		this.hvac.passenger.temperature.setTemperature(event.data.temperature);
	}.$bind(this);
}