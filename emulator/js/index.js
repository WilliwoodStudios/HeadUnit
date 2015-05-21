// Initialize the emulator
window.onload = function() {
	// Initialize the system
	var config = {
		theme: {
			rootClass: 'ui-theme-dark bold-weight'
		},
		isEmulator: (window.chrome && chrome.runtime && chrome.runtime.id) ? true : false
	}
	if (window.innerWidth > window.innerHeight) {
		config.theme.color = $system.Color.SUN_FLOWER; 
	} else {
		config.theme.color = $system.Color.ALIZARIN; 
	}
	
	
	$system.init(config);
	
	// Initialize UI
	$ui.init(screenChrome, config.theme);
	$emulator.chrome = $ui.screens[0];
}
