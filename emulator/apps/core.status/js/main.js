/* Copyright (c) 2015 Workshop 12 Inc. */
function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.TileGroup,
			tiles: [
				{
					component: $ui.TileBadge,
					img: 'img/badge_engine_trouble.png',
					caption: '<large>P0127</large>',
					accent: 'Code detected'
				}
			]
		},
		{
			component: $ui.List,
			style: $ui.GenericListItem,
			items: [
				{
					component: $ui.Header,
					caption: 'System Ready Check'	
				},
				{
					img: 'img/checkmark.png',
					title: 'Misfire',
					caption: 'Complete'
				},
				{
					img: 'img/warning.png',
					title: 'Fuel System',
					caption: 'Incomplete'
				},
				{
					img: 'img/checkmark.png',
					title: 'Components',
					caption: 'Complete'
				},
				{
					img: 'img/checkmark.png',
					title: 'Reserved',
					caption: 'Complete'
				},
				{
					img: 'img/checkmark.png',
					title: 'Catalyst',
					caption: 'Not Available'
				},
				{
					img: 'img/checkmark.png',
					title: 'Heated Catalyst',
					caption: 'Not Available'
				}
			]
		}
	
	];
	
}