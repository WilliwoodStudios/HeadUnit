function main() {
	this.component = $ui.WindowPane;
	this.content = [
		{
			component: $ui.List,
			style: $ui.PostListItem,
			items: [
				{
					user: 'brcewane',
					avatar: 'img/avatar.jpg',
					img: 'img/engine.jpg',
					caption: 'After a lot of hard work, the engine bay shave and wire tuck is complete!',
					title: 'Engine Bay Finished!',
					numLikes: 112,
					numComments: 12,
					liked: false,
					time: 'Fri May 29 2015 12:44:16 GMT-0400'
				},
				{
					user: 'brcewane',
					avatar: 'img/avatar.jpg',
					img: 'img/show.jpg',
					caption: 'This is a cool post',
					title: 'My Post',
					numLikes: 112,
					numComments: 12,
					liked: false,
					time: 'Fri May 29 2015 12:00:16 GMT-0400'
				}
			]
		}
	];
}