function main() {
	this.component = $ui.WindowPane;
	
	this.disableAnimation = true;
	
	this.content = [
		{
			component: $ui.Map,
			src: 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d11566.850079366603!2d-79.75120260000001!3d43.55003415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sca!4v1425591440044'
		}
	
	];
	
	this.onshow = function() {
		console.log('maps onshow');
	}
}