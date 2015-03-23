// The Audio Manager provides the interface to the audio services of Brainiac 
function AudioManager() {
	// Initialize the return object
	var object = {
		_mediaSources: [new PlayerMediaSource()], 
	}
	
	// Set our current media source
	object._currentMediaSource = object._mediaSources[0];
	
	// Load our sounds
	object._sounds = {};
	if ($system.isClientDevice == false) {
		object._sounds.BLIP = new Audio('sounds/blip.mp3');
		object._sounds.HORN = new Audio('sounds/horn.mp3');
		object._sounds.TOUCH = new Audio('sounds/Touch.ogg');
		object._sounds.TONE0 = new Audio('sounds/tones/0.wav');
		object._sounds.TONE1 = new Audio('sounds/tones/1.wav');
		object._sounds.TONE2 = new Audio('sounds/tones/2.wav');
		object._sounds.TONE3 = new Audio('sounds/tones/3.wav');
		object._sounds.TONE4 = new Audio('sounds/tones/4.wav');
		object._sounds.TONE5 = new Audio('sounds/tones/5.wav');
		object._sounds.TONE6 = new Audio('sounds/tones/6.wav');
		object._sounds.TONE7 = new Audio('sounds/tones/7.wav');
		object._sounds.TONE8 = new Audio('sounds/tones/8.wav');
		object._sounds.TONE9 = new Audio('sounds/tones/9.wav');
		object._sounds.TONE_POUND = new Audio('sounds/tones/p.wav');
		object._sounds.TONE_ASTERIK = new Audio('sounds/tones/s.wav');
	}
	
	// Play's the sound based on the SoundEffect value
	object.playSoundEffect = function(soundEffect) {
		if ($system.isClientDevice == true) return;
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
			case $system.SoundEffect.TONE0:
				this._sounds.TONE0.play();
				break;
			case $system.SoundEffect.TONE1:
				this._sounds.TONE1.play();
				break;
			case $system.SoundEffect.TONE2:
				this._sounds.TONE2.play();
				break;
			case $system.SoundEffect.TONE3:
				this._sounds.TONE3.play();
				break;
			case $system.SoundEffect.TONE4:
				this._sounds.TONE4.play();
				break;
			case $system.SoundEffect.TONE5:
				this._sounds.TONE5.play();
				break;
			case $system.SoundEffect.TONE6:
				this._sounds.TONE6.play();
				break;
			case $system.SoundEffect.TONE7:
				this._sounds.TONE7.play();
				break;
			case $system.SoundEffect.TONE8:
				this._sounds.TONE8.play();
				break;
			case $system.SoundEffect.TONE9:
				this._sounds.TONE9.play();
				break;
			case $system.SoundEffect.TONE_POUND:
				this._sounds.TONE_POUND.play();
				break;
			case $system.SoundEffect.TONE_ASTERIK:
				this._sounds.TONE_ASTERIK.play();
				break;
		}
	}
	object.playSoundEffect = object.playSoundEffect.bind(object);
	
	// Returns the list of available media sources
	object.getMediaSources = function() {
		return this._mediaSources;
	}
	object.getMediaSources = object.getMediaSources.bind(object);
	
	// Returns the currently active media sources
	object.getActiveMediaSource = function() {
		return this._currentMediaSource;
	}
	object.getActiveMediaSource = object.getActiveMediaSource.bind(object);
	
	return object;
}