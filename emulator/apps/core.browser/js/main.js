function main() {
	this.component = $ui.WindowPane;
	
	this.content = [
		{
			component: $ui.Browser,
			id: 'browser',
			src: 'http://workshoptwelve.com/blog',
			onfavoriteclick: function() {
				$ui.toast('Bookmark Added');
				var i,
					item,
					found = false,
					items = this.screen.bookmarks;
				for (i = 0; i < items.length; i++) {
					item = items[i];
					if (item.caption == this.src) {
						found = true;
						break;
					}	
				}
				if (found == false) {
					items.push({
						title: 'Untitled',
						img: 'img/icon-128x128.png',
						caption: this.src
					})
				}
				
			},
			onbookmarksclick: function() {
				$ui.push(bookmarks, this.screen.bookmarks);
			}
		}
	
	];
	
	this.onshow = function() {
		$data.addEventListener('onbookmark', this.onbookmark);
	}
	
	// Handle the user selecting a bookmarl
	this.onbookmark = function(event) {
		console.log(event);
		this.browser.src = event.data;
	}
	this.onbookmark = this.onbookmark.$bind(this);
	
	this.bookmarks = [
		{
			img: 'img/icon-128x128.png',
			title: 'Workshop 12',
			caption: 'http://workshoptwelve.com'
		},
		{
			img: 'img/icon-128x128.png',
			title: 'The BatBerry',
			caption: 'http://batberry.wordpress.com'
		}
	]
}