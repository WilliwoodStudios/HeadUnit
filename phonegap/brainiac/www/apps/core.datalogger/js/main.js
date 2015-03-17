function main() {
	this.component = $ui.WindowPane;
	
	this.disableAnimation = true;
	
	this.background = {
		img: 'img/background.jpg',
		colorized: true,
		position: 'center bottom',
	};
	
	this.content = [
		{
			component: $ui.CircleMenu,
			items: [
				{
					caption: '0-60',
					img: 'img/ic_zero_to_sixty.png',
					identifier: 'logger.zero.to.sixty'
				},
				{
					caption: 'horsepower',
					img: 'img/ic_horsepower.png',
					identifier: 'logger.horsepower'
				},
				{
					caption: 'drift angle',
					img: 'img/ic_drift_angle.png',
					identifier: 'logger.drift.angle'
				},
				{
					caption: 'track day',
					img: 'img/ic_track_day.png',
					identifier: 'logger.track.day'
				},
				{
					caption: '1/4 mile',
					img: 'img/ic_quarter_mile.png',
					identifier: 'logger.quarter.mile'
				},
				{
					caption: 'lateral g\'s',
					img: 'img/ic_g_forces.png',
					identifier: 'logger.g.forces'
				}
				
			],
			onclick: function(item) {
				if (item.identifier == 'logger.zero.to.sixty') {
					$ui.push(zeroToSixty);
				}
			}
		}
	
	];
	
	this.onshow = function() {
		
	}
}