var SoundEffect = {
	BLIP: 0,
	HORN: 1
}

// The Audio Manager provides the interface to the audio services
// of Brainiac 
function AudioManager(options) {
	// Initialize the return object
	var object = {
		options: {
			demo: false
		}
	}
	// See if we are in demo mode
	if (options && options.demo === true) {
		object.options.demo = options.demo;
		object._sounds = {};
		object._sounds.BLIP = new Audio('sounds/blip.mp3');
		object._sounds.HORN = new Audio('sounds/horn.mp3');
	}
	
	// Play's the sound based on the SoundEffect value
	object.playSoundEffect = function(soundEffect) {
		if (this.options.demo === true) {
			switch(soundEffect) {
				case SoundEffect.BLIP:
					this._sounds.BLIP.play();
					break;
				case SoundEffect.HORN:
					this._sounds.HORN.play();
					break;
			}
		} else {
			// Go to native audio manager
		}
	}
	object.playSoundEffect = object.playSoundEffect.bind(object);
	
	return object;
}