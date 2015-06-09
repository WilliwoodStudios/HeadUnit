/* Copyright (c) 2015 Workshop 12 Inc. */
function horsepower() {
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
					caption: 'Record HP/TQ',
					countdown: true,
					onstartclick: function() {
						// Reset the dyno chart
						this.screen.dynoChart.reset();
					},
					onrecord: function() {
						
						$system.audio.playSoundEffect($system.SoundEffect.HORN);
						// Fake out reaching 60 mph in 4.9 seconds in the emulator
						if ($system.config.isEmulator == true) {
							$ui.toast('The emulator simulates a 468 HP dyno run');
							var screen = this.screen;
							screen._rpm = 2500;
							screen._interval = window.setInterval(function(){
								screen._rpm = screen._rpm + 100;
								screen.dynoChart.setRPM(screen._rpm);
							},100);
							window.setTimeout(function() {
								window.clearInterval(screen._interval);
								screen.dynoFinished();
							},4500);
						}
					},
					oncountdown: function() {
						$system.audio.playSoundEffect($system.SoundEffect.BLIP);
					}
				},
				{
					component: $ui.TileDynoChart,
					id: 'dynoChart',
					provider: {
						id: 'runProvider',
						property: 'run'
					}
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'dynoProvider',
						property: 'horsepower'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'dynoProvider',
						property: 'horsepowerHistory'
					}
				},
				{
					component: $ui.TileTimeDonut,
					targetHigh: true,
					provider: {
						id: 'dynoProvider',
						property: 'torque'
					}
				},
				{
					component: $ui.TileTimeHistory,
					provider: {
						id: 'dynoProvider',
						property: 'torqueHistory'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'dynoProvider'
				},
				{
					component: $ui.DataProvider,
					id: 'runProvider'
				}
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			horsepower: {
				target: 500,
				value: 445,
				accent: 'Your Highest Horsepower',
				caption: 'hp'
			},
			horsepowerHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [435,442,440,445],
				caption: 'Recorded Horsepower'
			},
			torque: {
				target: 500,
				value: 428,
				accent: 'Your Highest Torque',
				caption: 'tq'
			},
			torqueHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [405,420,415,428],
				caption: 'Recorded Torque'
			}
		}
		// Populate the data provider
		this.dynoProvider.data = data; 
	};
	
	// Handle the dyno run being complete
	this.dynoFinished = function() {
		this.recordTile.reset();
		var date = new Date(),
			months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			formattedDate = months[date.getMonth()] +' ' + date.getDate() + '/' + (date.getFullYear() - 2000);
		// Add new data to the provider
		var existing = this.dynoProvider.data,
			data = {
				horsepower: existing.horsepower,
				horsepowerHistory: existing.horsepowerHistory,
				torque: existing.torque,
				torqueHistory: existing.torqueHistory
			};
		data.horsepower.value = 468;
		data.horsepowerHistory.labels.push(formattedDate);
		data.horsepowerHistory.data.push(data.horsepower.value);
		data.torque.value = 438;
		data.torqueHistory.labels.push(formattedDate);
		data.torqueHistory.data.push(data.torque.value);
		// Dyno data for this run
		var dyno = {
			run: {
				caption: 'Max 468 HP and 438 TQ',
				horsepower: [210,220,230,238,248,255,265,278,290,305,315,325,335,345,355,366,378,385,395,405,418,422,428,435,440,450,452,458,460,460,463,465,467,468,466,460,455,452,448,445,440],
				torque:     [200,210,220,228,238,245,255,268,275,290,300,310,320,330,340,350,358,365,365,375,388,392,398,405,410,420,422,428,430,430,433,435,437,438,436,430,425,422,418,415,410]
			}
		};
		// Re-populate the data providers
		this.runProvider.data = dyno;
		this.dynoProvider.data = data;
		
	}.$bind(this);
}

