// Initialize the emulator
window.onload = function() {
	// Initialize the system
	var config = {
		theme: {
			rootClass: 'ui-theme-dark bold-weight',
			color: $system.Color.ALIZARIN
		},
		isEmulator: (window.chrome && chrome.runtime && chrome.runtime.id) ? true : false
	}
	$system.init(config);
	
	// Initialize UI
	$ui.init(chromeApp, config.theme);
}

// Main Chrome definition
function chromeApp() {
	this.component = $ui.ChromeApp;
	
}