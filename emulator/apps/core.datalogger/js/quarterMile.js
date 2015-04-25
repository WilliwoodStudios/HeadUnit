function quarterMile() {
	this.component = $ui.WindowPane;
	this.animated = true;	
	this.backCaption = 'Back';
	
	this.content = [
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileRecord,
					id: 'recordTile',
					caption: 'Record 1/4 Mile',
					countdown: true,
					onstartclick: function() {
						this.screen.timerTile.reset();
					},
					onrecord: function() {
						this.screen.timerTile.start();
						$system.audio.playSoundEffect($system.SoundEffect.HORN);
						var screen = this.screen;
						// Fake out reaching 60 mph in 4.9 seconds
						window.setTimeout(function() {
							screen.fakeout();
						},1000);
					},
					oncountdown: function() {
						$system.audio.playSoundEffect($system.SoundEffect.BLIP);
					}
				},
				{
					component: $ui.TileTimer,
					id: 'timerTile'
				}
			]
		},
		{
			component: $ui.TileGroup,
			id: 'currentRun',
			visible: false,
			tiles: [
				{
					component: $ui.TileTimeDonut,
					provider: {
						id: 'quarterMileRun',
						property: 'result'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'quarterMileRun',
						property: 'stages'
					}
				}
			]
		},
		{
			component: $ui.Header,
			caption: 'Recorded Times'
		},
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileTimeDonut,
					provider: {
						id: 'quarterMileProvider',
						property: 'quarterMile'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'quarterMileProvider',
						property: 'quarterMileHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					provider: {
						id: 'quarterMileProvider',
						property: 'reactionTime'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'quarterMileProvider',
						property: 'reactionTimeHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					provider: {
						id: 'quarterMileProvider',
						property: 'sixtyFoot'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'quarterMileProvider',
						property: 'sixtyFootHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'quarterMileProvider'
				},
				{
					component: $ui.DataProvider,
					id: 'quarterMileRun'
				}
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			quarterMile: {
				target: 12.4,
				value: 13.21,
				accent: 'Your Best Time',
				caption: 'sec 1/4 mile'
			},
			quarterMileHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [14.4,13.5,13.9,13.21],
				caption: '1/4 mile times (sec)'
			},
			reactionTime: {
				target: 0.4,
				value: 1.353,
				accent: 'Best Reaction Time',
				caption: 'sec R/T'
			},
			reactionTimeHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [1.5,1.4,1.5,1.353],
				caption: 'Reaction times (sec)'
			},
			sixtyFoot: {
				target: 2.0,
				value: 2.481,
				accent: 'Best 60 ft Time',
				caption: 'sec 60 ft'
			},
			sixtyFootHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [3,2.5,2.7,2.481],
				caption: 'Sixty Foot times (sec)'
			},
		}
		// Populate the data provider
		this.quarterMileProvider.data = data; 
	};
	
	// Handle any speed change events
	this.fakeout = function() {
		// Stop and reset our tiles
		this.timerTile.stop();
		this.recordTile.reset();
		this.currentRun.setVisible(true);
		var data = {
			result: {
				target: 12.4,
				value: 13.21,
				accent: 'This Race',
				caption: 'sec 1/4 mile'
			},
			stages: {
				labels: ['R/T','60','330','1/8','1000','1/4'],
				data: [1.353,2.481,6.151,8.934,11.261,13.21],
				caption: 'Time points (sec)'
			},
		}
		
		// Populate the data provider
		this.quarterMileRun.data = data; 
	}
	this.fakeout = this.fakeout.bind(this);
}

