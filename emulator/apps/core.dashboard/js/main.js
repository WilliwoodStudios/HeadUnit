/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.TileGroup,
			tiles: [
				/*{
					component: $ui.TileProfile,
					provider: {
						id: 'dashboardProvider',
						property: 'profileInfo'
					}					
				},*/
				{
					component: $ui.TileAcceleration,
					provider: {
						id: 'dashboardProvider',
						property: 'accelerationInfo'
					}
				},
				{
					component: $ui.TileDistance,
					provider: {
						id: 'dashboardProvider',
						property: 'distanceInfo'
					}
				},
				{
					component: $ui.TileBadge,
					provider: {
						id: 'dashboardProvider',
						property: 'badgeInfo'
					}
				},
				{
					component: $ui.TileBraking,
					provider: {
						id: 'dashboardProvider',
						property: 'brakingInfo'
					}
				},
				{
					component: $ui.TileMPG,
					provider: {
						id: 'dashboardProvider',
						property: 'mpgInfo'
					}
				},
				{
					component: $ui.TileFuel,
					provider: {
						id: 'dashboardProvider',
						property: 'fuelInfo'
					}
				},
				{
					component: $ui.TileIdle,
					provider: {
						id: 'dashboardProvider',
						property: 'idleInfo'
					}
				},
				{
					component: $ui.TileIdleDetails,
					provider: {
						id: 'dashboardProvider',
						property: 'idleDetailsInfo'
					}
				}
			],
			attachedObjects: [
				{
					component: $ui.DataProvider,
					id: 'dashboardProvider'
				}
			]
		}	
	];
	
	this.onshow = function() {
		// Set the screen data
		var data = {
			profileInfo: {
				backgroundImg: "../img/subaru.jpg",
				avatar: "../img/avatar.png",
				userName: "brcewane",
				stats: {
					friends: 12,
					clubs: 6,
					score: 42369,
					rank: 2
				}			
			},
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
				img: 'img/badge_idle_monochrome.png',
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
		this.dashboardProvider.data = data; 
	}
}