/* Copyright (c) 2015 Workshop 12 Inc. */
var $core;
var $system;

// Initialize our toolkit
window.onload = function() {
	if (window.parent.$core) {
		$core = window.parent.$core;
	}
	// Get the system object
	if (!$system) {
		if (window.location !== window.parent.location) {
			// We are in the emulator
			$system = window.parent.$system;
		} else {
			console.log('WARNING: $system not defined');
		}
	} 
	$system.registerApp('core.suspension', $ui);
	// Initialize
	$ui.init(main, $system.config.theme);	
}