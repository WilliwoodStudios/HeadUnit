function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.List,
			style: $ui.GenericListItem,
			items: [
				{
				  img: 'img/ruler.png',
				  id: 'setting.color',
				  title: 'Colors',
				  caption: 'Change the color scheme of the screens'
				},
				{
				  img: 'img/palette.png',
				  id: 'setting.measurement',
				  title: 'Measurements',
				  caption: 'Units of measure for speed, distance, temperature etc.'
				},
				{
				  img: 'img/wifi.png',
				  id: 'setting.network',
				  title: 'Network',
				  caption: 'Configure your internet connectivity'
				},
				{
				  img: 'img/bluetooth.png',
				  id: 'setting.bluetooth',
				  title: 'Bluetooth',
				  caption: 'Configure your Bluetooth connectivity'
				}
			],
			onaction: function(event) {
				$ui.toast('Settings are currently not available in the emulator');
			}
		}
	];
	
}