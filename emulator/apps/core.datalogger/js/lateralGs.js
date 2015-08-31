/* Copyright (c) 2015 Workshop 12 Inc. */
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
						if ($system.config.isEmulator == true || true) { // TODO - fix
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
					img: 'img/cartop_small.png',
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'lateralProvider',
						property: 'slipAngle'
					}
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'lateralProvider',
						property: 'force'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'lateralProvider',
						property: 'forceHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'lateralProvider'
				},
			]
		}	
	];
	
	this.onshow = function() {
		this._rotation = 0;
		this._threshold = 0;
		
		// Set the screen data
		var data = {
			slipAngle: {
				target: 1.5,
				value: 1.10,
				accent: 'Your Best Slip Angle',
				caption: 'deg'
			},
			force: {
				target: 1.1,
				value: 0.99,
				accent: 'Your Best G-Force',
				caption: 'g(s)'
			},
			forceHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [0.8,0.92,1.03,0.99],
				caption: 'Recorded Lateral Gs'
			}
		}
		// Populate the data provider
		this.lateralProvider.data = data; 
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
		var existing = this.lateralProvider.data,
			data = {
				force: existing.force,
				slipAngle: existing.slipAngle,
				forceHistory: existing.forceHistory,
			};
		data.force.value = 1.03;
		data.slipAngle.value = 1.18;
		data.forceHistory.labels.push(formattedDate);
		data.forceHistory.data.push(data.force.value);
		this.lateralProvider.data = data;
	}.$bind(this);
}

