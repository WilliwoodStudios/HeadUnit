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