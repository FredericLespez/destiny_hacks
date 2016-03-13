"use strict";

// Constructor
function DestinyModel(displayName, membershipType, ignoreCase, callbackStatus) {
    this.urlBungiePlatformDestiny = "http://localhost:9000";
    this.bucketToIgnoreList = [
	// "3448274439", // Helmet
	// "3551918588", // Gauntlets
	// "14239492",   // Chest Armor
	// "20886954",   // Leg Armor
	// "1585787867", // Class Armor
	// "434908299",  // Artifacts
	// "1498876634", // Primary Weapons
	// "2465295065", // Special Weapons
	// "953998645",  // Heavy Weapons
	// "4023194814", // Ghost
	"1801258597", // Quest
	"3284755031", // Subclass
	"2025709351", // Vehicle
	"3796357825", // Sparrow Horn
	"284967655",  // Ships
	"2973005342", // Shaders
	"4274335291", // Emblems
	"3054419239", // Emotes
	"3865314626", // Materials
	"1469714392", // Consumables
	"375726501",  // Mission
	"2197472680", // Bounties
	"2689798308", // Glimmer
	"2689798304", // Legendary Marks
    ];
    this.displayName = displayName;
    this.membershipType = membershipType;
    this.membershipId = '';
    this.currentStepNumber = 0;
    // Status : 1 => OK / 2 => KO
    this.currentStepStatus = 1;
    // Progress : 1 =>  1% / 2 =>  2% and so on
    this.currentStepProgress = 0;
    this.isOffline = false;
    this.getAccountSummary = {};
    this.getAllItemsSummary = {};
    this.getItemDetail = {};
    this.urlEndpointList = {
	GetMembershipIdByDisplayName: "/Platform/Destiny/{membershipType}/Stats/GetMembershipIdByDisplayName/{displayName}/?ignorecase={ignoreCase}",
	GetAccountSummary: "/Platform/Destiny/{membershipType}/Account/{destinyMembershipId}/Summary/",
	GetAllItemsSummary: "/Platform/Destiny/{membershipType}/Account/{destinyMembershipId}/Items/",
	GetItemDetail: "/Platform/Destiny/{membershipType}/Account/{destinyMembershipId}/Character/{characterId}/Inventory/{itemInstanceId}/"
    };

    if (typeof offlineData !== 'undefined') {
	console.log("Inside the model, we are OFFLINE");
	this.isOffline = true;
	this.currentStepNumber   = offlineData.currentStepNumber;
	this.currentStepStatus   = offlineData.currentStepStatus;
	this.currentStepProgress = offlineData.currentStepProgress;
	this.membershipId        = offlineData.membershipId;
	this.getAccountSummary   = offlineData.getAccountSummary;
	this.getAllItemsSummary  = offlineData.getAllItemsSummary;
	this.getItemDetail       = offlineData.getItemDetail;
    } else {
	console.log("Inside the model, we are ONLINE");
	this.isOffline = false;
    }

    if (ignoreCase === undefined) {
	this.ignoreCase = false;
    } else {
	this.ignoreCase = ignoreCase;
    };

    if (callbackStatus === undefined) {
	this.callbackStatus = false;
    } else {
	this.callbackStatus = callbackStatus;
    };

    this._callDestinyEndPoint = function (endPoint, arg, callback) {
	var urlEndPoint;

	urlEndPoint = this.urlBungiePlatformDestiny + this.urlEndpointList[endPoint];
	urlEndPoint = urlEndPoint.replace(/{membershipType}/g, String(this.membershipType));
	urlEndPoint = urlEndPoint.replace(/{displayName}/g, String(this.displayName));
	urlEndPoint = urlEndPoint.replace(/{ignoreCase}/g, String(this.ignoreCase));
	urlEndPoint = urlEndPoint.replace(/{destinyMembershipId}/g, String(this.membershipId));
	urlEndPoint = urlEndPoint.replace(/{characterId}/g, String(arg.characterId));
	urlEndPoint = urlEndPoint.replace(/{itemInstanceId}/g, String(arg.itemInstanceId));

	$.ajax({
	    url: urlEndPoint,
	    context: this
	}).done(callback);
    };

    //
    // STEP 1: Get membership ID
    //
    this.runStep1 = function () {
	this.currentStepNumber = 1;
	this.currentStepStatus = 0;
	this.currentStepProgress = 0;

	console.log("MODEL: Start step 1");

	this._callDestinyEndPoint("GetMembershipIdByDisplayName", {}, this._callbackGetMembershipIdByDisplayName);
    };

    this._callbackGetMembershipIdByDisplayName = function (json) {
	if (json.ErrorCode === 1) {
	    this.membershipId = json.Response;
	    this.currentStepStatus = 1;
	    this._closeStep1();
	} else {
	    console.log("Getting Membership ID By Display Name failed: " +
			json.ErrorStatus + " / " +
			json.Message
		       );
 	    this.currentStepStatus = 2;
	};
    };

    this._closeStep1 = function () {
	this.currentStepProgress = 100;
	console.log("MODEL: Step 1 complete. Running callback");
	this.callbackStatus(this);
	console.log("MODEL: End of Step 1.");
	this.runStep2();
    };

    //
    // STEP 2: Get Account Summary
    //
    this.runStep2 = function () {
	this.currentStepNumber = 2;
	this.currentStepStatus = 0;
	this.currentStepProgress = 0;

	console.log("MODEL: Start step 2");

	this._callDestinyEndPoint("GetAccountSummary", {}, this._callbackGetAccountSummary);
    };

    this._callbackGetAccountSummary = function (json) {
	if (json.ErrorCode === 1) {
	    // FIXME: Do we need to clone the data ?
	    this.getAccountSummary = $.extend({}, json.Response.data);
	    this.currentStepStatus = 1;
	    this._closeStep2();
	} else {
	    console.log("Getting Account Summary failed: " +
			json.ErrorStatus + " / " +
			json.Message
		       );
 	    this.currentStepStatus = 2;
	};
    };

    this._closeStep2 = function () {
	this.currentStepProgress = 100;
	console.log("MODEL: Step 2 complete. Running callback");
	this.callbackStatus(this);
	console.log("MODEL: End of Step 2.");
	this.runStep3();
    };

    //
    // STEP 3: Get All Items Summary
    //
    this.runStep3 = function () {
	this.currentStepNumber = 3;
	this.currentStepStatus = 0;
	this.currentStepProgress = 0;

	console.log("MODEL: Start step 3");

	this._callDestinyEndPoint("GetAllItemsSummary", {}, this._callbackGetAllItemsSummary);
    };

    this._callbackGetAllItemsSummary = function (json) {
	if (json.ErrorCode === 1) {
	    // FIXME: Do we need to clone the data ?
	    this.getAllItemsSummary = $.extend({}, json.Response.data);
	    this.currentStepStatus = 1;
	    this._closeStep3();
	} else {
	    console.log("Getting All Items Summary failed: " +
			json.ErrorStatus + " / " +
			json.Message
		       );
 	    this.currentStepStatus = 2;
	};
    };

    this._closeStep3 = function () {
	this.currentStepProgress = 100;
	console.log("MODEL: Step 3 complete. Running callback");
	this.callbackStatus(this);
	console.log("MODEL: End of Step 3.");
	this.runStep4();
    };

    //
    // STEP 4: Get Item Detail (for all items...)
    //
    this.runStep4 = function () {
	this.currentStepNumber = 4;
	this.currentStepStatus = 1;
	this.currentStepProgress = 0;
	this._itemInstanceIdList = [];

	console.log("MODEL: Start step 4");

	const items = this.getAllItemsSummary.items;
	const characters = this.getAllItemsSummary.characters;
	var itemInstanceIdList = [];
	var i;
	for (i = 0; i < items.length; i++) {
	    const item = items[i];
	    const itemBucketTypeHash = (DestinyMWC.DestinyInventoryItemDefinition[item.itemHash]).bucketTypeHash;
	    const itemType = (DestinyMWC.DestinyInventoryItemDefinition[item.itemHash]).itemType;
	    // Tier type: 4=>Rare, 5=>Legendary, 6=>Exotic
	    const itemTierType = (DestinyMWC.DestinyInventoryItemDefinition[item.itemHash]).tierType;
	    // Look up next item if this item bucket is on the ignore list
	    if (this.bucketToIgnoreList.indexOf(String(itemBucketTypeHash)) > -1) {
	    	continue;
	    }
	    const characterIndex = (item.characterIndex === -1) ? 0 : item.characterIndex;
	    // Ignore engrams and foundry orders
	    if ((item.itemType === 8) || (item.itemType === 0)) {
	    	continue;
	    }
	    // Ignore everything except exotic and legendary items
	    if ((itemTierType !== 5) && (itemTierType !== 6)) {
	    	continue;
	    }
	    const characterId = (characters[characterIndex]).characterBase.characterId;
	    itemInstanceIdList.push([characterId, item.itemId]);
	}

	for (i = 0; i < itemInstanceIdList.length; i++) {
	    var characterId = itemInstanceIdList[i][0];
	    var itemInstanceId = itemInstanceIdList[i][1];

	    this._itemInstanceIdList.push(itemInstanceId);
	    this._callDestinyEndPoint("GetItemDetail", {
		characterId: characterId,
		itemInstanceId: itemInstanceId
	    }, this._callbackGetItemDetail);
	}
    };

    this._callbackGetItemDetail = function (json) {
	if (json.ErrorCode === 1) {
	    // FIXME: Do we need to clone the data ?
	    const itemInstanceId = json.Response.data.item.itemInstanceId;
	    this.getItemDetail[itemInstanceId] = $.extend({}, json.Response.data);
	    this.currentStepStatus = 1;
	    this._closeStep4(itemInstanceId);
	} else {
	    console.log("Getting Item Detail failed: " +
			json.ErrorStatus + " / " +
			json.Message
		       );
 	    this.currentStepStatus = 2;
	};
    };

    this._closeStep4 = function (itemInstanceId) {
	const index = this._itemInstanceIdList.indexOf(itemInstanceId);

	if (index > -1) {
	    this._itemInstanceIdList.splice(index, 1);
	}

	if (this._itemInstanceIdList.length === 0) {
	    this.currentStepProgress = 100;
	    console.log("MODEL: Step 4 complete. Running callback");
	    this.callbackStatus(this);
	    console.log("MODEL: End of Step 4");
	    this.runStep5();
	}
    };

    //
    // STEP 5: That's all folks !
    //

    this.runStep5 = function () {
	this.currentStepNumber = 5;
	this.currentStepStatus = 0;
	this.currentStepProgress = 0;

	console.log("MODEL: Start step 5");
    };

    //
    // Method Refresh
    //
    this.Refresh = function () {
	if (this.isOffline) {
	    const StepNumber = this.currentStepNumber;
	    const StepStatus = this.currentStepStatus;
	    const StepProgress = this.currentStepProgress;
	    // Simulate the previous steps
	    for (var i = 1; i < StepNumber; i++) {
		console.log("MODEL (OFFLINE MODE): Start step %i", i);
		console.log("MODEL (OFFLINE MODE): Step %d complete. Running callback", i);
		this.currentStepNumber = i;
		this.currentStepStatus = 1;
		this.currentStepProgress = 100;
		this.callbackStatus(this);
		console.log("MODEL (OFFLINE MODE): End of Step %d", i);
	    }
	    // Simulate the last step
	    console.log("MODEL (OFFLINE MODE): Start step %i", StepNumber);
	    console.log("MODEL (OFFLINE MODE): Step %d complete. Running callback", StepNumber);
	    this.currentStepNumber = StepNumber;
	    this.currentStepStatus = StepStatus;
	    this.currentStepProgress = StepProgress;
	    this.callbackStatus(this);
	    console.log("MODEL (OFFLINE MODE): End of Step %d", StepNumber);
	} else {
	    this.runStep1();
	}
    };

}
