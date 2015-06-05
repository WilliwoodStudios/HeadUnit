function lateralGs() {
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
					caption: 'Record Lateral G\'s',
					onstartclick: function() {
						this.screen._threshold = this.screen._threshold + 720;
					},
					onstopclick: function() {
						window.clearInterval(this.screen._interval);
						this.screen.recordingFinished();
					},
					onrecord: function() {
						// Fake out our angles in the emulator
						if ($system.config.isEmulator == true) {
							$ui.toast('The emulator simulates a short skidpad test');
							var screen = this.screen;
							// Slide Left
							screen._interval = window.setInterval(function() {
								var step = 10;
								if (screen._rotation < screen._threshold) {
									screen._rotation = screen._rotation + step;
									screen.lateralTile.rotation = screen._rotation;
								} else {
									window.clearInterval(screen._interval);
									screen.recordingFinished();
								}
							},100);
						}
					},
				},
				{
					component: $ui.TileLateralGs,
					id: 'lateralTile',
					img: 'img/cartop.png',
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'angleProvider',
						property: 'longestDrift'
					}
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'angleProvider',
						property: 'angle'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'angleProvider',
						property: 'angleHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'angleProvider'
				},
			]
		}	
	];
	
	this.onshow = function() {
		this._rotation = 0;
		this._threshold = 0;
		
		// Set the screen data
		var data = {
			longestDrift: {
				target: 6,
				value: 4,
				accent: 'Your Longest Drift',
				caption: 'sec'
			},
			angle: {
				target: 90,
				value: 72.5,
				accent: 'Your Largest Angle',
				caption: 'degrees'
			},
			angleHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [10,40,37,55],
				caption: 'Recorded Drift Angles'
			}
		}
		// Populate the data provider
		this.angleProvider.data = data; 
	};
	
	// Do clean up
	this.ondestroy = function() {
		window.clearInterval(this._interval);
	}
	
	// Handle the dyno run being complete
	this.recordingFinished = function() {
		this.recordTile.reset();
		var date = new Date(),
			months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			formattedDate = months[date.getMonth()] +' ' + date.getDate() + '/' + (date.getFullYear() - 2000);
		// Add new data to the provider
		var existing = this.angleProvider.data,
			data = {
				longestDrift: existing.longestDrift,
				angle: existing.angle,
				angleHistory: existing.angleHistory,
			};
		data.angle.value = 75.2;
		data.angleHistory.labels.push(formattedDate);
		data.angleHistory.data.push(data.angle.value);
		this.angleProvider.data = data;
	}.$bind(this);
}

