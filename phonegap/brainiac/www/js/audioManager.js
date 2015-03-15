
// The Audio Manager provides the interface to the audio services
// of Brainiac 
function AudioManager(options) {
	// Initialize the return object
	var object = {
		options: {
			demo: false
		}
	}
	// Load our sounds
	object._sounds = {};
	object._sounds.BLIP = new Audio('sounds/blip.mp3');
	object._sounds.HORN = new Audio('sounds/horn.mp3');
	object._sounds.TOUCH = new Audio('sounds/Touch.ogg');
	
	
	// Play's the sound based on the SoundEffect value
	object.playSoundEffect = function(soundEffect) {
		switch(soundEffect) {
			case $system.SoundEffect.BLIP:
				this._sounds.BLIP.play();
				break;
			case $system.SoundEffect.HORN:
				this._sounds.HORN.play();
				break;
			case $system.SoundEffect.TOUCH:
				this._sounds.TOUCH.play();
				break;
		}
	}
	object.playSoundEffect = object.playSoundEffect.bind(object);
	
	return object;
}