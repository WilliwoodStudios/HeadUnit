/* Copyright (c) 2015 Workshop 12 Inc. */
function screenChrome() {
	this.disableAnimation = true;
	this.component = $ui.HeadUnitChrome;
	this.primaryWindow = {
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
		visible: (false),
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
			$ui.addEventListener($system.EventType.ONREQUESTSUSPENSIONUI, this.onrequestsuspensionui, this);
			if ($system.config.isClientDevice != true) {
				$ui.addEventListener($system.EventType.ONMEDIAMINIMIZE, this.onmediaminimize, this);
				$ui.addEventListener($system.EventType.ONMEDIARESTORE, this.onmediarestore, this);
				$ui.addEventListener($system.EventType.ONCONFIRMGARAGEDOOR, this.onconfirmgaragedoor, this);
			}
		}
		this.onthemechange();
	}
	
	this.onsettingsclick = function() {
		$core.openSettings();		
	};
	
	// Update the driver temperature setting
	this.ondrivertempchange = function(event) {
		this.hvac.driver.temperature.setTemperature(event.data.temperature);
	}.$bind(this);
	
	// Update the passenger temperature setting
	this.onpassengertempchange = function(event) {
		this.hvac.passenger.temperature.setTemperature(event.data.temperature);
	}.$bind(this);
	
	// system requested the UI for adjusting a suspension corner
	this.onrequestsuspensionui = function(event) {
		$ui.push(wedgeSuspension, {corner: event.data.corner})
	}.$bind(this);
	
	
	// system requested the UI for Confirming Garage Door
	this.onconfirmgaragedoor = function(event) {
		$ui.push(confirmGarageScreen);
	}.$bind(this);

	this.onthemechange = function() {
		if ("brainiacSystemTheme" in window) {
			brainiacSystemTheme.adviseTheme($ui.theme);
  		}
	}.$bind(this);
	
	// User minimized media
	this.onmediaminimize = function() {
		this.primaryWindow.size = $ui.Size.HUGE;
		this.secondaryWindow.size = $ui.Size.TINY;
	}.$bind(this);
	
	// User resored media app size
	this.onmediarestore = function() {
		this.primaryWindow.size = $ui.Size.NORMAL;
		this.secondaryWindow.size = $ui.Size.NORMAL;
	}.$bind(this);
}