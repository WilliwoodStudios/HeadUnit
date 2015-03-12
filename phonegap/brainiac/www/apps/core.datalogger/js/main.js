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
					icon: 'img/ic_zero_to_sixty.png',
					onclick: function() {
						$ui.push(zeroToSixty);
					}
				},
				{
					caption: 'horsepower',
					icon: 'img/ic_horsepower.png',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'drift angle',
					icon: 'img/ic_drift_angle.png',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'track day',
					icon: 'img/ic_track_day.png',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: '1/4 mile',
					icon: 'img/ic_quarter_mile.png',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				},
				{
					caption: 'lateral g\'s',
					icon: 'img/ic_g_forces.png',
					onclick: function() {
						console.log(this.caption + ' clicked');
					}
				}
				
			]
		}
	
	];
	
	this.onshow = function() {
		
	}
}