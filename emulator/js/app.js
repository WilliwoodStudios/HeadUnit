/* Copyright (c) 2015 Workshop 12 Inc. */
window.onload = function() {
	// Initialize the system
	var config = {
		theme: $ui.themeDark,
		isEmulator: (window.chrome && chrome.runtime && chrome.runtime.id) ? true : false
	}
	console.log(config);
	$system.init(config);
	
	// Initialize UI
	$ui.init(chromeApp, config);
}

// Main Chrome definition
function chromeApp() {
	this.component = $ui.ChromeApp;
}