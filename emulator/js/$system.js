var $system = {
	version: {
		major: 1,
		minor: 0,
		revision: 0,
		build: 1
	},
	_events: [],
	_config: {
		themeStyle: 'ui-theme-dark',
		themeColor: '#D94646',
		themeWeight: 'bold-weight',
		celsius: false
	},
	Color: {
		TURQUOISE: {
			key: 'color.turquoise',
			value: '#1ABC9C'
		},
		EMERALD: {
			key: 'color.emerald',
			value: '#2ECC71'
		},
		PETER_RIVER: {
			key: 'color.peter.river',
			value: '#3498DB'
		},
		AMETHYST: {
			key: 'color.amethyst',
			value: '#AF7AC4'
		},
		WET_ASPHAULT: {
			key: 'color.wet.asphault',
			value: '#34495E'
		},
		GREEN_SEA: {
			key: 'color.green.sea',
			value: '#16A085'
		},
		NEPHRITIS: {
			key: 'color.nephritis',
			value: '#27AE60'
		},
		BELIZE_HOLE: {
			key: 'color.belize.hole',
			value: '#2980B9'
		},
		WISTERIA: {
			key: 'color.wisteria',
			value: '#8E44AD'
		},
		MIDNIGHT_BLUE: {
			key: 'color.midnight.blue',
			value: '#2C3E50'
		},
		SUN_FLOWER: {
			key: 'color.sun.flower',
			value: '#F1C40F'
		},
		CARROT: {
			key: 'color.carrot',
			value: '#E67E22'
		},
		ALIZARIN: {
			key: 'color.alizarin',
			value: '#E74C3C'
		},
		CONCRETE: {
			key: 'color.concrete',
			value: '#AAB7B7'
		},
		ORANGE: {
			key: 'color.orange',
			value: '#F39C12'
		},
		PUMPKIN: {
			key: 'color.pumpkin',
			value: '#D35400'
		},
		POMEGRANATE: {
			key: 'color.pomegranate',
			value: '#C0392B'
		},
		SILVER: {
			key: 'color.silver',
			value: '#BDC3C7'
		},
		ASBESTOS: {
			key: 'color.asbestos',
			value: '#98A3A3'
		}
	},
	MediaSourceType: {
		PLAYER: 0,
		AMFM: 1,
		XM: 2
	},
	EventType: {
		ONSPEEDCHANGE: 'onspeedchange',
		ONFUELCHANGE: 'onfuelchange',
		ONRPMCHANGE: 'onrpmchange',
		ONDRIVERTEMPCHANGE: 'ondrivertempchange',
		ONPASSENGERTEMPCHANGE: 'onpassengertempchange'
	},
	SoundEffect: {
		BLIP: 0,
		HORN: 1,
		TOUCH: 2,
		TONE0: 3,
		TONE1: 4,
		TONE2: 5,
		TONE3: 6,
		TONE4: 7,
		TONE5: 8,
		TONE6: 9,
		TONE7: 10,
		TONE8: 11,
		TONE9: 12,
		TONE_POUND: 13,
		TONE_ASTERIK: 14		
	},
	
	// Initialize the system object
	init: function(config) {
		this.isClientDevice = (window.innerWidth < 400);
		// Grab the configuration
		this._config.themeStyle = (config.themeStyle) ? config.themeStyle : this._config.themeStyle;
		this._config.themeColor = (config.themeColor) ? config.themeColor : this._config.themeColor;
		this._config.themeWeight = (config.themeWeight) ? config.themeWeight : this._config.themeWeight;
		this._config.celsius = (config.celsius) ? config.celsius : this._config.celsius;
		// Create our services
		this.audio = new AudioManager(this.isClientDevice);
		this.contacts = new ContactsManager();
		this.phone = new PhoneManager();
	},
	
	// Returns if the system is using Celsius for temperatures
	isCelsius: function() {
		return this._config.celsius;
	},
	
	// Add an event listener
	addEventListener: function(eventType, callback, screen) {
		var item = {
			eventType: eventType,
			callback: callback,
			screen: screen
		}
		this._events.push(item);
	},
	
	// Remove an event listener
	removeEventListener: function(eventType, callback) {
		var i,
			item,
			systemEvent;
		for (i = 0; i < this._events.length; i++) {
			item = this._events[i];
			if (item.eventType == eventType && item.callback == callback) {
				this._events.splice(i, 1);
				return;
			}
		}
	},
	
	// Remove all event listeners for a screen
	removeEventListenersForScreen: function(screen) {
		var i,
			item,
			systemEvent;
		for (i = this._events.length - 1; i >= 0; i--) {
			if (this._events.length === 0) return;
			item = this._events[i];
			if (item && (item.screen == screen)) {
				this._events.splice(i, 1);
			}
		}
	}
}