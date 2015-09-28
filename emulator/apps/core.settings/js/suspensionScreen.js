/* Copyright (c) 2015 Workshop 12 Inc. */
function suspensionScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
		{
			component: $ui.List,
			style: $ui.GenericListItem,
			items: [
				{
				 	img: 'img/ridetech.png',
				  	id: 'suspension.choice',
					hasArrow: true,
				  	title: 'System Choice',
				  	caption: 'RideTech RidePRO'
				},
				{
				 	img: 'img/ridetech.png',
				  	id: 'suspension.presets',
					hasArrow: true,
				  	title: 'Preset Management',
				  	caption: '3 Programmable Heights'
				},
				{
				 	img: 'img/ruler.png',
				  	id: 'suspension.default',
					hasArrow: true,
				  	title: 'Configure Default Height',
				  	caption: 'Current Default is (Preset 2) labeled "Driving"'
				}
			],
			onaction: function(event) {
				if (event.target) {
					if (event.target.id == 'suspension.choice') {
						$ui.push(suspensionChoiceScreen);
					} else if (event.target.id == 'suspension.presets') {
						$ui.push(suspensionPresetScreen);
					}
				}
			}
		}
	];
	
	
	this.onshow = function() {
		
	}
}