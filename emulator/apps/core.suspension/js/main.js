/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;

	this.content = [
		{
			component: $ui.Suspension,
			leftFront: 21,
			rightFront: 25,
			leftRear: 30,
			rightRear: 30,
			tank: 112,
			img: 'img/cartop.png'
		}
	];

	this.onshow = function() {
		//$ui.addEventListener('relay_switch_config_change', this.onswitchchange, this);
		//$system.relays.getRelayList(this.onrelaylistload);
	}
}