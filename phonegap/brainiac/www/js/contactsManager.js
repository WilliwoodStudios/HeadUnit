// The Contacts Manager provides the interface to the contacts services of Brainiac 
function ContactsManager(options) {
	// Initialize the return object
	var object = {};	
	
	// Public function to retrieve the list of contacts
	object.getContactList = function(callback) {
		$emulator.loadJSONFromUrl('data/data-contactList.json', callback);
	}
	object.getContactList = object.getContactList.bind(object);
	
	return object;
}