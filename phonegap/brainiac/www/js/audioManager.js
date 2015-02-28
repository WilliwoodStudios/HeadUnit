var audioManager = {
	Sounds: {
		BLIP: 0,
		HORN: 1
	},
	
	options: {
		demo: false
	},
	
	// Initialize the audio manager
	init: function(options) {
		// See if we are in demo mode
		if (options && options.demo === true) {
			this.options.demo = options.demo;
			this._sounds = {};
			this._sounds.BLIP = new Audio('sounds/blip.mp3');
			this._sounds.HORN = new Audio('sounds/horn.mp3');
		}
	},
	
	// Play's the sound
	playSound: function(soundId) {
		if (this.options.demo === true) {
			switch(soundId) {
				case this.Sounds.BLIP:
					this._sounds.BLIP.play();
					break;
				case this.Sounds.HORN:
					this._sounds.HORN.play();
					break;
			}
		} else {
			// Go to native audio manager
		}
	}
}