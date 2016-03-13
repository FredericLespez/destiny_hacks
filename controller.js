function controller_init(view_callback) {

    const displayName = settings.displayName;
    const membershipType = settings.membershipType;
    const ignoreCase = settings.ignoreCase;
    var model;

    if (typeof offlineData !== 'undefined') {
	console.log("Inside the controller, we are OFFLINE");
    } else {
	console.log("Inside the controller, we are ONLINE");
    }

    model = new DestinyModel(displayName,
    			     membershipType,
    			     ignoreCase,
    			     view_callback
    			    );
    model.Refresh();
}
