/* Copyright (c) 2015 Workshop 12 Inc. */
function relayScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
		{
			component: $ui.List,
			id: 'relayList',
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
		$ui.addEventListener('relay_switch_config_change', this.onswitchchange, this);
		
		var items = [
			{
				title: 'Accessory Lights',
				caption: 'Bank #1',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png',
				board: '1254-68798-447',
				bank: 1
			},
			{
				title: 'Methanol',
				caption: 'Bank #2',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png',
				board: '1254-68798-447',
				bank: 2
			},
			{
				title: 'Intercooler Mist',
				caption: 'Bank #3',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png',
				board: '1254-68798-447',
				bank: 3
			},
			{
				title: 'Garage Door Opener',
				isMomentary: true,
				caption: 'Bank #4',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/relays.png',
				board: '1254-68798-447',
				bank: 4
			},
			{
				title: 'Door Actuators',
				caption: 'Bank #5',
				isPolaritySwitch: true,
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png',
				board: '1254-68798-447',
				bank: 5
			},
			{
				title: 'Hide Away License Plate',
				caption: 'Bank #6',
				isPolaritySwitch: true,
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png',
				board: '1254-68798-447',
				bank: 6
			},
			{
				title: 'Unused',
				caption: 'Bank #7',
				isPolaritySwitch: true,
				shown: false,
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png',
				board: '1254-68798-447',
				bank: 7
			},
			{
				title: 'Unused',
				isPolaritySwitch: true,
				shown: false,
				caption: 'Bank #8',
				accent: 'Relay Accessory Serial No. 1254-68798-447',
				img: 'img/polarity.png',
				board: '1254-68798-447',
				bank: 8
			}
			
		];
		this.relayProvider.data = {items: items};
	}
	
	// Handle any config changes
	this.onswitchchange = function(event) {
		var i, 
			item;
		for (i = 0; i < this.relayList.items.length; i++) {
			item = this.relayList.items[i];
			if (item.board == event.data.board && item.bank == event.data.bank) {
				item.title = event.data.name;
				item.isMomentary = event.data.isMomentary;
				item.shown = event.data.shown;
				break;
			}
		}
	}.$bind(this);
}