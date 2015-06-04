function main() {
	this.component = $ui.WindowPane;
	
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
					caption: 'dyno',
					img: 'img/ic_horsepower.png',
					identifier: 'logger.dyno'
				},
				{
					caption: 'drift angle',
					img: 'img/ic_drift_angle.png',
					identifier: 'logger.drift.angle'
				},
				/*{
					caption: 'track day',
					img: 'img/ic_track_day.png',
					identifier: 'logger.track.day'
				},*/
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
				} else if (item.identifier == 'logger.quarter.mile') {
					$ui.push(quarterMile);
				} else if (item.identifier == 'logger.dyno') {
					$ui.push(horsepower);
				}
			}
		}
	
	];
	
	this.onshow = function() {
		// Get our background image
		var backgroundImg = $core.getBackgroundImage($ui.theme.color);
		if (backgroundImg) {
			this.setBackground(new ScreenBackground('../../'+backgroundImg));
		}
	}
}