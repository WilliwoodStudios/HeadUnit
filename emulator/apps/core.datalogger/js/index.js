/* Copyright (c) 2015 Workshop 12 Inc. */
var $core;
var $system;

// Initialize our toolkit
window.onload = function() {
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
			$system.registerApp('core.datalogger', $ui);
		} else {
			console.log('WARNING: $system not defined');
		}
	} else {
		$system.registerApp('core.datalogger', $ui);
	}
	// Initialize
	$ui.init(main, theme);	
}