/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.List,
			style: $ui.GenericListItem,
			items: [
				{				  
				  	img: 'img/palette.png',
				  	id: 'setting.color',
					hasArrow: true,
				  	title: 'Colors',
				  	caption: 'Change the system color theme'
				},
				{
				 	img: 'img/ruler.png',
				  	id: 'setting.measurement',
					hasArrow: true,
				  	title: 'Measurements',
				  	caption: 'Units of measure for speed, distance, temperature etc.',
					accent: 'Not enabled quite yet'
				},
				{
				  	img: 'img/wifi.png',
				  	id: 'setting.network',
					hasArrow: true,
					visible: ($system.isClientDevice == true) ? false : true,
				  	title: 'Network',
				  	caption: 'Configure your internet connectivity',
					accent: 'Not enabled quite yet'
				},
				{
				  	img: 'img/bluetooth.png',
				  	id: 'setting.bluetooth',
					hasArrow: true,
					visible: ($system.isClientDevice == true) ? false : true,
				  	title: 'Bluetooth',
				  	caption: 'Configure your Bluetooth connectivity',
					accent: 'Not enabled quite yet'
				},
				{
				  	img: 'img/relays.png',
				  	id: 'setting.relays',
					hasArrow: true,
				  	title: 'Switches',
				  	caption: 'Configure your relay board accessory'
				},
				{
				  	img: 'img/suspension.png',
				  	id: 'setting.suspension',
					hasArrow: true,
				  	title: 'Suspension',
				  	caption: 'Configure your digital air management'
				}
			],
			onaction: function(event) {
				var id = event.target.id;
				if (id == 'setting.color') {
					$ui.push(colorScreen);
				} else if (id == 'setting.relays') {
					$ui.push(relayScreen);
				} else if (id == 'setting.suspension') {
					$ui.push(suspensionScreen);
				} else {
					$ui.toast('This setting is currently not available in the emulator');
				}
			}
		}
	];
	
}