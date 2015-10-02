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
				 	img: 'img/accuair.png',
				  	id: 'management.accuair.elevel',
				  	title: 'AccuAir E-Level',
				  	caption: '3 Programmable Heights'
				},
				{
				 	img: 'img/accuair.png',
				  	id: 'management.accuair.switchspeed',
				  	title: 'AccuAir SwitchSpeed',
				  	caption: '0 Programmable Heights, 3 Valve Adjustment Speeds'
				},
				{
				 	img: 'img/airlift.png',
				  	id: 'management.airlift.autopilot.v2',
				  	title: 'Air Lift AutoPilot V2',
				  	caption: '8 Programmable Heights'
				},
				{
				 	img: 'img/airrex.png',
				  	id: 'management.airrex',
				  	title: 'AirRex',
				  	caption: '3 Programmable Heights'
				},
				{
				 	img: 'img/ridetech.png',
				  	id: 'management.ridetech.ridepro',
				  	title: 'RideTech RidePRO',
				  	caption: '3 Programmable Heights'
				}
			],
			onaction: function(event) {
				
			}
		}
	];
	
	
	this.onshow = function() {
		
	}
}