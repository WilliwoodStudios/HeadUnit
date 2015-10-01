/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		/***************** Smartphone START ***********************/
		{
			component: $ui.DockLayout,
			id: 'dockLayout',
			visible: false,
			dock: [{
				component: $ui.SegmentedControl,
				selectedIndex: 0,
				options: ['Status', 'Readiness'],
				onclick: function() {
					if (this.selectedIndex === 0) {
						this.screen.tabbedPane.selectTab(this.screen.statusTab);
					} else {
						this.screen.tabbedPane.selectTab(this.screen.readyTab);
					}
				}
			}],
			content: [
				{
					component: $ui.TabbedPane,
					id: 'tabbedPane',
					tabs: [
						{
							component: $ui.Tab,
							id: 'statusTab',
							content:[]
						},
						{
							component: $ui.Tab,
							id: 'readyTab',
							content:[]
						}
					]
				}
			]
		},	
		/***************** Smartphone END ***********************/	
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileBadge,
					img: 'img/badge_engine_trouble.png',
					caption: '<large>P0127</large>',
					accent: 'Tap engine to clear codes',
					onclick: function() {
						$system.obd.confirmCodeClear();
					}
				},
				{
					component: $ui.TileDescription,
					caption: 'Intake Air Temperature Too High',
					accent: 'Tap for more details',
					onclick: function() {
						console.log('clicked description')
					}
				}
			]
		},
		{
			component: $ui.List,
			id: 'readinessList',
			style: $ui.GenericListItem,
			items: [
				{
					component: $ui.Header,
					caption: 'System Readiness Check'	
				},
				{
					img: 'img/checkmark.png',
					title: 'Misfire',
					caption: 'Complete'
				},
				{
					img: 'img/warning.png',
					title: 'Fuel System',
					caption: 'Incomplete',
					accent: 'Vehicle has not completed its system checks'
				},
				{
					img: 'img/checkmark.png',
					title: 'Components',
					caption: 'Complete'
				},
				{
					img: 'img/checkmark.png',
					title: 'Catalyst',
					caption: 'Complete'
				},
				{
					img: 'img/checkmark.png',
					title: 'Heated Catalyst',
					caption: 'Not Available'
				},
				{
					img: 'img/warning.png',
					title: 'Evaporative System',
					caption: 'Incomplete',
					accent: 'Vehicle has not completed its system checks'
				},
				{
					img: 'img/checkmark.png',
					title: 'Secondary Air System',
					caption: 'Not Available'
				},
				{
					img: 'img/checkmark.png',
					title: 'Oxygen (O2) Sensor',
					caption: 'Complete'
				},
				{
					img: 'img/checkmark.png',
					title: 'Oxygen (O2) Sensor Heater',
					caption: 'Not Available'
				},
				{
					img: 'img/checkmark.png',
					title: 'Exhaust Gas Recirculation',
					caption: 'Complete'
				}
			]
		}
	
	];
	
	// If this is a mobile device then we need to re-arrange the screen
	this.oncreate = function() {
		if ($system.isClientDevice == true) {
			var tileGroup = this.content[1],
				dockLayout = this.content[0],
				readinessList = this.content[2],
				statusTab = dockLayout.content[0].tabs[0],
				readyTab = dockLayout.content[0].tabs[1];
			// Set our visibility state
			//tileGroup.visible = false;
			dockLayout.visible = true;
			// Move our controls
			statusTab.content.push(tileGroup);
			readyTab.content.push(readinessList);
			// Remove the column layout
			this.content.splice(1,2);
		}
	};
}