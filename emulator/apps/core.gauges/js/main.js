/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.RealTimeGauge,
					mode: "speed",
					pid: 0xd
				},
				{
					component: $ui.RealTimeGauge,
					mode: "timingAdvance",
					position: "top",
					pid: 0xe
				},
				{
					component: $ui.RealTimeGauge,
					mode: "rpm",
					pid: 0xc
				},
				{
					component: $ui.RealTimeGauge,
					mode: "temperature",
					title: "Air Intake",
					position: "left",
					pid: 0xf
				},
				{
					component: $ui.RealTimeGauge,
					mode: "percentage",
					title: "Throttle Position",
					pid: 0x11
				},
				{
					component: $ui.RealTimeGauge,
					mode: "temperature",
					title: "Engine Oil",
					position: "right",
					___pid: 0x5c
				},
				{
					component: $ui.RealTimeGauge,
					mode: "oxygenSensor",
					position: "top"
				}
			]
		}	
	];
	
	this.onshow = function() {
	};
}