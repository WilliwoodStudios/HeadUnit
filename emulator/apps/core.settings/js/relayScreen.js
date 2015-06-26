/* Copyright (c) 2015 Workshop 12 Inc. */
function relayScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
		{
			component: $ui.List,
			style: $ui.GenericListItem,
			provider: {
				id: 'relayProvider',
				property: 'items'
			},
			onaction: function(event) {
				$ui.push(switchScreen, event.target)
			}
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'relayProvider'
		}
	];
	
	this.onshow = function() {
		/*var items = [],
			entry;
		for(var propertyName in  $system.Color) {
			entry = {
				color: $system.Color[propertyName]
			}
		   entry.selected =  (entry.color == $ui.theme.backgroundImageColor);
		   items.push(entry);
		}
		this.colorProvider.data = {items: items};*/
		
		var items = [
			{
				title: 'Accessory Lights',
				caption: 'Bank #1',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png'
			},
			{
				title: 'Methanol',
				caption: 'Bank #2',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png'
			},
			{
				title: 'Intercooler Mist',
				caption: 'Bank #3',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png'
			},
			{
				title: 'Garage Door Opener',
				isMomentary: true,
				caption: 'Bank #4',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png'
			},
			{
				title: 'Door Actuators',
				caption: 'Bank #5',
				isPolaritySwitch: true,
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png'
			},
			{
				title: 'Hide Away License Plate',
				caption: 'Bank #6',
				isPolaritySwitch: true,
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png'
			},
			{
				title: 'Unused',
				caption: 'Bank #7',
				isPolaritySwitch: true,
				enabled: false,
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png'
			},
			{
				title: 'Unused',
				isPolaritySwitch: true,
				enabled: false,
				caption: 'Bank #8',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png'
			}
			
		];
		this.relayProvider.data = {items: items};
	}
}