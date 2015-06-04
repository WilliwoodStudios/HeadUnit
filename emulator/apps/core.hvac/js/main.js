function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			id: "fanSpeedControl",
			component: $ui.FanSpeedControl
		},
		{
			id: "fanDirectionControl",
			component: $ui.FanDirectionControl
		}
	];
	
	this.onFanSpeedChanged = function(speed) {
		this.fanDirectionControl.setEnabled(speed != 0);		
	}.$bind(this);
	
	this.onshow = function() {
		console.log("I am trying to show my bits.");
		console.log("Control: " + this.fanSpeedControl);
		
		this.fanSpeedControl.onfanspeedchanged = this.onFanSpeedChanged;
		
		var backgroundImg = $core.getBackgroundImage($ui.theme.color);
		if (backgroundImg) {
			this.setBackground(new ScreenBackground('../../'+backgroundImg));
		}
	};	
}