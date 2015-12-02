/* Copyright (c) 2015 Workshop 12 Inc. */
function suspensionChoiceScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Choose Your System';
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
				 	img: 'img/airlift.png',
				  	id: 'management.airlift.autopilot.v2',
				  	title: 'Air Lift AutoPilot V2',
				  	caption: '8 Programmable Heights'
				},
				{
				 	img: 'img/airlift.png',
				  	id: 'management.airlift.3H',
				  	title: 'Air Lift 3H (Height + Pressure)',
				  	caption: '5 Programmable Heights'
				},
				{
				 	img: 'img/airlift.png',
				  	id: 'management.airlift.3P',
				  	title: 'Air Lift 3P (Pressure Only)',
				  	caption: '5 Programmable Heights'
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
				$ui.toast('Switching between Air Systems currently is not available in the emulator');
			}
		}
	];
	
	
	this.onshow = function() {
		
	}
}