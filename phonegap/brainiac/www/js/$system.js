var $system = {
	version: {
		major: 1,
		minor: 0,
		revision: 0,
		build: 1
	},
	_events: [],
	config: {
		inHeadUnit: true,
		brandColor: '#D94646',
		tileFontColor: '#747474',
		celsius: false
	},
	// System events
	EventType: {
		ONSUBSCRIBE: 'onsubscribe',
		ONUNSUBSCRIBE: 'onunsubscribe',
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
		this.config.inHeadUnit = (config.inHeadUnit) ? config.inHeadUnit : this.config.inHeadUnit;
		this.config.brandColor = (config.brandColor) ? config.brandColor : this.config.brandColor;
		this.config.tileFontColor = (config.tileFontColor) ? config.tileFontColor : this.config.tileFontColor;
		// Create our services
		this.audio = new AudioManager(this.isClientDevice);
		this.contacts = new ContactsManager();
		this.phone = new PhoneManager();
	},
	
	// Create a system event object
	SystemEvent: function(eventType, data) {
		var object = {
			eventType: eventType,
			data: data
		}
		return object;
	},

	// Add an event listener
	addEventListener: function(eventType, callback, screen) {
		var item = {
			eventType: eventType,
			callback: callback,
			screen: screen
		}
		this._events.push(item);
		// Raise the onsubscribe event
		if ($emulator) {
			var systemEvent = new $system.SystemEvent($system.EventType.ONSUBSCRIBE, {eventType: eventType});
			$emulator.raiseEvent(systemEvent);
		}
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
				// Raise the onunsubscribe event
				if ($emulator) {
					systemEvent = new $system.SystemEvent($system.EventType.ONUNSUBSCRIBE, {eventType: eventType});
					$emulator.raiseEvent(systemEvent);
				}
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
				// Raise the onunsubscribe event
				systemEvent = new $system.SystemEvent($system.EventType.ONUNSUBSCRIBE, {eventType: item.eventType});
				$emulator.raiseEvent(systemEvent);
			}
		}
	}
}