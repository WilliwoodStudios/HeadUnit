var $system;
// Initialize our toolkit
window.onload = function() {
	if (!$system) {
		if (window.location !== window.parent.location) {
			// We are in the emulator
			$system = window.parent.$system;
		} else {
			console.log('WARNING: $system not defined');
		}
	} 
	// Initialize
	$ui.init(main, $system.config.theme);	
}