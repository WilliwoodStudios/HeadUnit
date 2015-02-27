function paneZeroToSixty() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-zero-to-sixty';
	
	this.content = [
		{
			component: ws12.TileGroup,
			tiles: [
				{
					component: ws12.TileZeroToSixty,
					provider: {
						id: 'dashboardProvider',
						property: 'zeroToSixty'
					}
				},
				{
					component: ws12.TileZeroToSixtyHistory,
					provider: {
						id: 'dashboardProvider',
						property: 'zeroToSixtyHistory'
					}
				},
				{
					component: ws12.TileRecord,
					id: 'recordTile',
					caption: 'Record 0-60 Time',
					countdown: true,
					onrecord: function() {
						this.screen.timerTile.start();
						window.setTimeout(this.screen.timerTile.stop,3900);
					}					
				},
				{
					component: ws12.TileTimer,
					id: 'timerTile',
					onstop: function() {
						this.screen.recordTile.reset();
						var data = {
							zeroToSixty: {
								target: 3.8,
								value: this.getSeconds()
							},
							zeroToSixtyHistory: {
								labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14','Feb 27/15'],
								data: [5.2,6.3,4.2,4.5,this.getSeconds()]
							}
						}
						// Populate the dashboard data provider
						this.screen.dashboardProvider.setData(data); 
					}
				}
			],
			attachedObjects: [
				{
					component: ws12.DataProvider,
					id: 'dashboardProvider'
				}
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			zeroToSixty: {
				target: 3.8,
				value: 4.2
			},
			zeroToSixtyHistory: {
				labels: ['Apr 10/14','May 12/14','Jul 18/14','Aug 22/14'],
				data: [5.2,6.3,4.2,4.5]
			}
		}
		// Populate the dashboard data provider
		this.dashboardProvider.setData(data); 
	}
}