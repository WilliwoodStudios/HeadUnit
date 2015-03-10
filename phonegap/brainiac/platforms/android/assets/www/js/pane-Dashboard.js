function paneDashboard() {
	this.component = ws12.WindowPane;
	
	this.menuImgClass = 'ws12-icon-head-unit-dashboard';
	
	this.content = [
		{
			component: ws12.TileGroup,
			tiles: [
				{
					component: ws12.TileAcceleration,
					provider: {
						id: 'dashboardProvider',
						property: 'accelerationInfo'
					}
				},
				{
					component: ws12.TileDistance,
					provider: {
						id: 'dashboardProvider',
						property: 'distanceInfo'
					}
				},
				{
					component: ws12.TileBadge,
					provider: {
						id: 'dashboardProvider',
						property: 'badgeInfo'
					}
				},
				{
					component: ws12.TileBraking,
					provider: {
						id: 'dashboardProvider',
						property: 'brakingInfo'
					}
				},
				{
					component: ws12.TileMPG,
					provider: {
						id: 'dashboardProvider',
						property: 'mpgInfo'
					}
				},
				{
					component: ws12.TileFuel,
					provider: {
						id: 'dashboardProvider',
						property: 'fuelInfo'
					}
				},
				{
					component: ws12.TileIdle,
					provider: {
						id: 'dashboardProvider',
						property: 'idleInfo'
					}
				},
				{
					component: ws12.TileIdleDetails,
					provider: {
						id: 'dashboardProvider',
						property: 'idleDetailsInfo'
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
			idleInfo: { 
				value: 70
			},
			accelerationInfo: {
				min: 0,
				max: 1.5,
				value: 0.9
			},
			brakingInfo: {
				min: 0,
				max: 1.5,
				value: 0.3
			},
			mpgInfo: {
				max: 32,
				value: 20,
				abbreviation: 'MPG'
			},
			badgeInfo: {
				img: 'img/badge_idle.png',
				caption: '<large>27</large>min commute',
				accent: 'Quickest trip to work!'
			},
			distanceInfo: {
				data: [20,25,9.2],
				units: 'miles'
			},
			fuelInfo: {
				value: 6,
				data: [90,50,30]
			},
			idleDetailsInfo: {
				labels: ['Sun','Mon','Tue','Wed','Thur','Fri','Today'],
				data: [0,35,17,65,0,10,15]
			}
		}
		// Populate the dashboard data provider
		this.dashboardProvider.setData(data); 
	}
}