// The Phone Manager provides the interface to the phone services of Brainiac 
function PhoneManager(options) {
	// Initialize the return object
	var object = {};	
	
	// Public function to retrieve the list of contacts
	object.getCallList = function(callback) {
		$core._loadJSONFromUrl('data/data-call-list.json', callback);
	}
	object.getCallList = object.getCallList.bind(object);
	
	return object;
}