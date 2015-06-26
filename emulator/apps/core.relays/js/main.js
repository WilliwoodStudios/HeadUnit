/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.Toggle,
			id: 'bankOne',
			caption: 'Accessory Lights'
		},
		{
			component: $ui.Toggle,
			id: 'bankTwo',
			caption: 'Methanol'
		},
		{
			component: $ui.Toggle,
			id: 'bankThree',
			caption: 'Intercooler Mist'
		},
		{
			component: $ui.Toggle,
			id: 'bankFour',
			caption: 'Secondary Fuel Pump'
		}
	];
	
}