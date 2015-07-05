/* Copyright (c) 2015 Workshop 12 Inc. */
function colorScreen() {
	this.component = $ui.WindowPane;
	this.animated = true;
	this.backCaption = 'Back';
	this.content = [
		{
			component: $ui.List,
			style: $ui.ColorListItem,
			provider: {
				id: 'colorProvider',
				property: 'items'
			},
			onaction: function(event) {
				var i,
					variable,
					theme = $ui.themeDark,
					color = event.target.color;
				// Update properties
				theme.backgroundImageColor = color;
				theme.chart.color_OK = color;
				theme.chart.color_GREAT = color;
				theme.chart.color_GOOD = color;
				theme.chart.color_RANDOM1 = color;
				// Update variables
				for (i = 0; i < theme.variables.length; i ++) {
					variable = theme.variables[i];
					if (variable.name == '@brand-color' || variable.name == '@profile-wedge-color') {
						variable.value = color;
					}
				}
				$core.updateTheme(theme);
			}
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'colorProvider'
		}
	];
	
	this.onshow = function() {
		var items = [],
			entry;
		for(var propertyName in  $system.Color) {
			entry = {
				color: $system.Color[propertyName]
			}
		   entry.selected =  (entry.color == $ui.theme.backgroundImageColor);
		   items.push(entry);
		}
		this.colorProvider.data = {items: items};
	}
}