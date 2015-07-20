/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;

	this.content = [
		{
			component: $ui.ColumnLayout,
			fillToParent: true,
			columns: [
				{
					component: $ui.Column,
					content: [
						{
							component: $ui.DockLayout,
							location: $ui.DockLayout.DockLocation.BOTTOM,
							dock: [
								{
						            component: $ui.Button,
						            caption: 'Add Preset'
						        }
							],
							content: [
								{
									component: $ui.List,
									style: $ui.SuspensionListItem,
									items: [
										{
											component: $ui.Header,
											caption: 'Height Presets'	
										},
										{
											caption: 'Parked'
										},
										{
											caption: 'Driving'
										},
										{
											caption: 'Full Height'
										},
										{
											caption: 'My Driveway',
											style: 'location'
										},
										{
											caption: 'Over 90 km/h',
											style: 'speed'
										}
									],
									onaction: function(event) {
										
									}
								}
							]
						}
					]
				},
				{
					component: $ui.Column,
					span: 2,
					content: [
						{
							component: $ui.Suspension,
							leftFront: 21,
							rightFront: 25,
							leftRear: 30,
							rightRear: 30,
							tank: 112,
							img: 'img/cartop.png'
						}
					]
				}
			]
		}
		
	];

	this.onshow = function() {
		//$ui.addEventListener('relay_switch_config_change', this.onswitchchange, this);
		//$system.relays.getRelayList(this.onrelaylistload);
	}
}