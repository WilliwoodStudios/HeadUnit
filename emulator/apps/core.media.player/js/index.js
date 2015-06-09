/* Copyright (c) 2015 Workshop 12 Inc. */
var $core;
var $system;

// Initialize our toolkit
window.onload = function () {
	var theme;
	// Get the core object
	if (window.parent.$core) {
		$core = window.parent.$core;
	}
	if (!$system) {
		if (window.location !== window.parent.location) {
			// We are in the emulator
			$system = window.parent.$system;
			theme = $system.config.theme;
		} else {
			console.log('WARNING: $system not defined');
		}
	}
	if (!("$data" in window) && window.parent && window.parent.$data) {
		$data = window.parent.$data;
	} 
	// Initialize
	$ui.init(main, theme);
}