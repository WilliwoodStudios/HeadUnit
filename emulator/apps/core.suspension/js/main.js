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
				options: ['Pressure', 'Presets'],
				onclick: function() {
					if (this.selectedIndex === 0) {
						this.screen.tabbedPane.selectTab(this.screen.pressureTab);
					} else {
						this.screen.tabbedPane.selectTab(this.screen.presetTab);
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
							id: 'pressureTab',
							content:[]
						},
						{
							component: $ui.Tab,
							id: 'presetTab',
							content:[]
						}
					]
				}
			]
		},	
		/***************** Smartphone END ***********************/	
		{
			component: $ui.ColumnLayout,
			id: 'mainColumnLayout',
			fillToParent: true,
			columns: [
				{
					component: $ui.Column,
					borderRight: true,
					content: [
						{
							component: $ui.DockLayout,
							id: 'presetDock',
							location: $ui.DockLayout.DockLocation.BOTTOM,
							dock: [
								{
						            component: $ui.Button,
						            caption: 'Add Condition'
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
											caption: 'Parked',
											preset: 1
										},
										{
											caption: 'Driving',
											preset: 2
										},
										{
											caption: 'Full Height',
											preset: 3
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
										if (event && event.target && event.target.preset) {
											$system.suspension.choosePreset(event.target.preset);
										}
										console.log(event);
										
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
							id: 'suspensionDisplay',
							img: 'img/cartop.png',
							onrightfrontclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'rf'});
									$core.raiseEvent(systemEvent);
								}
							},
							onleftfrontclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'lf'});
									$core.raiseEvent(systemEvent);
								}
							},
							onleftrearclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'lr'});
									$core.raiseEvent(systemEvent);
								}
							},
							onrightrearclick: function() {
								if (window.$core) {
									var systemEvent = new $ui.DataEvent($system.EventType.ONREQUESTSUSPENSIONUI, {corner: 'rr'});
									$core.raiseEvent(systemEvent);
								}
							}
						}
					]
				}
			]
		}
		
	];

	// If this is a mobile device then we need to re-arrange the screen
	this.oncreate = function() {
		if ($system.isClientDevice == true) {
			var mainColumnLayout = this.content[1],
				dockLayout = this.content[0],
				pressureTab = dockLayout.content[0].tabs[0],
				presetTab = dockLayout.content[0].tabs[1],
				presetDock = mainColumnLayout.columns[0].content[0],
				suspension = mainColumnLayout.columns[1].content[0];
			// Set our visibility state
			mainColumnLayout.visible = false;
			dockLayout.visible = true;
			// Move our controls
			pressureTab.content.push(suspension);
			presetTab.content.push(presetDock);
			// Remove the column layout
			this.content.splice(1,1);
		}
	};

	this.onshow = function() {
		$ui.addEventListener($system.EventType.ONSUSPENSIONDATA, this.onsuspensiondata, this);
		$system.suspension.requestCurrentData();
	};
	
	// Update the suspension levels
	this.onsuspensiondata = function(event) {
		if (event && event.data) {
			this.suspensionDisplay.leftFront = event.data.lf;
			this.suspensionDisplay.leftRear = event.data.lr;
			this.suspensionDisplay.rightFront = event.data.rf;
			this.suspensionDisplay.rightRear = event.data.rr;
			this.suspensionDisplay.tank = event.data.tank;
		}
	}.$bind(this);
}