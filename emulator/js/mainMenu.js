function mainMenu() {
	this.id = 'mainMenu';
	this.component = $ui.WindowPane;
	this.disableAnimation = true;
	
	this.content = [
		{
			component: $ui.CircleMenu,
			provider: {
				id: 'mainMenuProvider',
				property: 'items'
			},
			onclick: function(item) {
				 $core.openApp(item);
			}
		}
	];
	
	this.attachedObjects = [
		{
			component: $ui.DataProvider,
			id: 'mainMenuProvider',
			onbeforeupdate: function() {
				var i,
					item;
				// Only show the media menu option in landscape
				for (i = 0; i < this.data.items.length; i++) {
					item = this.data.items[i];
					item.caption = item.name;
					item.img = 'apps/'+item.id+'/'+item.icon;
					if ($system.isClientDevice == true) {
						item.visible = (item.availability.driversDevice == true);
					} else {
						if (item.availability.headUnit == false) {
							item.visible = false;
						} else if (item.id == 'core.media.player') {
							item.visible = window.innerWidth > window.innerHeight;
						}
					} 
				}
			}
		}
	];
	
	// Load the menu
	this.onshow = function() {
		$core.getAppsList(this.onapplistrefresh);
		// Get our background image
		var backgroundImg = $core.getBackgroundImage($ui.theme.color);
		if (backgroundImg) {
			this.setBackground(new ScreenBackground(backgroundImg));
		}
	};
	
	// Refresh the list of apps
	this.onapplistrefresh = function(apps) {
		var data = {
			items: apps
		}
		this.mainMenuProvider.data = data;
	}
	this.onapplistrefresh = this.onapplistrefresh.bind(this);
}