"use strict";

function print_hash(hash) {
    var orderedKeys = [];

    for(let key in hash) {
	if (key === 'talentGrid') {
	    continue;
	}
	orderedKeys.push(key);
    }
    orderedKeys.sort();

    for(let key of orderedKeys) {
	const value = hash[key];
	const keyOutput = $('<span>').text(key + " => ");
	var valueOutput;
	if (String(value).substring(0,1) === "/") {
	    valueOutput = $('<img/>', {
		src: "https://www.bungie.net" + value,
		alt: "Icon for " + key,
	    });
	} else {
	    valueOutput = $('<span>').text(value);
	}
	$("#content").append($('<p>').append(keyOutput).append(valueOutput));
    }

    $("#content").append($('<table>').append($('<tr>').attr('id', 'talentGrid')));
    var col, row;
    for (col = 0; col < hash.talentGrid.length; col++) {
	$("#content #talentGrid").append($('<td>').attr('id', 'col' + col).attr('style', 'vertical-align: top;text-align: center;'));
	for (row = 0; row < (hash.talentGrid[col]).length; row++) {
	    $("#content #talentGrid #col" + col).append($('<img/>', {
		src: "https://www.bungie.net" + (hash.talentGrid[col][row]).icon,
		alt: "Icon for " + (hash.talentGrid[col][row]).name,
	    })).append('<br>' +
		       (hash.talentGrid[col][row]).name + '<br>' +
		       (hash.talentGrid[col][row]).node + '<br>' +
		       (hash.talentGrid[col][row]).isActivated + '<br>' +
		       (hash.talentGrid[col][row]).progressPercent + '<br>'
		      );
	}
    }

}

function view_header(model) {
    if (model.isOffline) {
        $("#isOffline").html("OFFLINE");
    } else {
        $("#isOffline").html("ONLINE");
    }

    $("#currentStepNumber").html(model.currentStepNumber);
    $("#currentStepStatus").html(model.currentStepStatus);
    $("#currentStepProgress").html(model.currentStepProgress);

    if (model.currentStepNumber >= 1) {
	$("#displayName").html(model.displayName);
	$("#membershipType").html(model.membershipType);
	$("#membershipId").html(model.membershipId);
    }

    if (model.currentStepNumber >= 2) {
	$("#clanName").html(model.getAccountSummary.clanName);
	$("#clanTag").html(model.getAccountSummary.clanTag);
    }
}

function view_print_offline_data(model) {
    view_header(model);

    if (model.currentStepNumber >= 4 && model.currentStepProgress === 100) {
	var offlineData = {};
	offlineData.currentStepNumber   = model.currentStepNumber;
	offlineData.currentStepStatus   = model.currentStepStatus;
	offlineData.currentStepProgress = model.currentStepProgress;
	offlineData.membershipId        = model.membershipId;
	offlineData.getAccountSummary   = model.getAccountSummary;
	offlineData.getAllItemsSummary  = model.getAllItemsSummary;
	offlineData.getItemDetail       = model.getItemDetail;

	var content = "offlineData = " + JSON.stringify(offlineData) + ";\n";
	var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
	$('#download')
	    .append($('<a>')
		    .attr('href', uriContent)
		    .attr('download', 'Offline_Data.js')
		    .text('Download'));
    }
}

function view_item(model) {
    const DestinyClassDefinition = DestinyMWC.DestinyClassDefinition;
    var i;

    // Empty page content
    $("#content").text('');

    view_header(model);

    if (model.currentStepNumber >= 4) {
	// const itemId = "6917529082077118204"; // Armor
	// const itemId = "6917529077502486504"; // Weapon Choleric Dragon SRT-49
	// const itemId = "6917529077482249852"; // Weapon Void Edge
	//const itemId = "6917529081948154111"; // Weapon Telesto
	const itemId = "6917529081948151933"; // Armor exotic Achlyophage Symbiote
	const itemDetail = model.getItemDetail[itemId];
	const itemFull = itemDetail.item;
	const item = {};
	item.hash = itemFull.itemHash;
	item.name = (DestinyMWC.DestinyInventoryItemDefinition[item.hash]).itemName;
	item.bucketTypeHash = (DestinyMWC.DestinyInventoryItemDefinition[item.hash]).bucketTypeHash;
	item.bucketTypeIdentifier = (DestinyMWC.DestinyInventoryBucketDefinition[item.bucketTypeHash]).bucketIdentifier;
	item.bucketTypeName = (DestinyMWC.DestinyInventoryBucketDefinition[item.bucketTypeHash]).bucketName;
	item.tierTypeName = (DestinyMWC.DestinyInventoryItemDefinition[item.hash]).tierTypeName;
	item.type = (DestinyMWC.DestinyInventoryItemDefinition[item.hash]).itemType;
	item.subType = (DestinyMWC.DestinyInventoryItemDefinition[item.hash]).itemSubType;
	item.level = itemFull.itemLevel;
	item.typeName = (DestinyMWC.DestinyInventoryItemDefinition[item.hash]).itemTypeName;
	item.qualityLevel = itemFull.qualityLevel;
	item.isGridComplete = itemFull.isGridComplete;
	item.damageTypeHash = itemFull.damageTypeHash;
	if (item.damageTypeHash !== 0) {
	    item.damageTypeName = (DestinyMWC.DestinyDamageTypeDefinition[item.damageTypeHash]).damageTypeName;
	    item.damageTypeIconPath = (DestinyMWC.DestinyDamageTypeDefinition[item.damageTypeHash]).iconPath;
	    item.damageTypeShowIcon = (DestinyMWC.DestinyDamageTypeDefinition[item.damageTypeHash]).showIcon;
	}
	item.location = itemFull.location;
	item.state = itemFull.state;

	item.progressionHash = itemFull.progression.progressionHash;
	item.progressionName = (DestinyMWC.DestinyProgressionDefinition[item.progressionHash]).name;
	item.progressionIcon = (DestinyMWC.DestinyProgressionDefinition[item.progressionHash]).icon;

	if ('primaryStat' in itemFull) {
	    item.primaryStatHash = itemFull.primaryStat.statHash;
	    item.primaryStatValue = itemFull.primaryStat.value;
	    item.primaryStatName = (DestinyMWC.DestinyStatDefinition[item.primaryStatHash]).statName;
	    item.primaryStatIcon = (DestinyMWC.DestinyStatDefinition[item.primaryStatHash]).icon;
	}

	item.fullJson = JSON.stringify(itemFull, null, 4);

	// Getting Stats
	for (i = 0; i < itemFull.stats.length; i++) {
	    const itemFullStats = itemFull.stats[i];
	    item['stats' + i + '_hash'] = itemFullStats.statHash;
	    item['stats' + i + '_value'] = itemFullStats.value;
	    item['stats' + i + '_maximumValue'] = itemFullStats.maximumValue;
	    item['stats' + i + '_name'] = (DestinyMWC.DestinyStatDefinition[itemFullStats.statHash]).statName;
	    item['stats' + i + '_icon'] = (DestinyMWC.DestinyStatDefinition[itemFullStats.statHash]).icon;
	}

	// Getting Perks
	for (i = 0; i < itemFull.perks.length; i++) {
	    const itemFullPerks = itemFull.perks[i];
	    item['perks' + i + '_hash'] = itemFullPerks.perkHash;
	    item['perks' + i + '_isActive'] = itemFullPerks.isActive;
	    item['perks' + i + '_iconPath'] = itemFullPerks.iconPath;
	}

	// Getting talents
	item.talentGrid = [];
	item.talentGridHash = itemFull.talentGridHash;
	const talentGrid = (DestinyMWC.DestinyTalentGridDefinition[itemFull.talentGridHash]);
	const talentGridNodes = talentGrid.nodes;
	const itemTalentNodes = itemDetail.talentNodes;
	for (i = 0; i < talentGridNodes.length; i++) {
	    const itemTalentNode = itemTalentNodes[i];
	    const talentGridNode = talentGridNodes[i];
	    const row = talentGridNode.row;
	    const col = talentGridNode.column;
	    const stepIndex = itemTalentNode.stepIndex;
	    if (itemTalentNode.hidden === true) {
		continue;
	    }

	    if (item.talentGrid[col] === undefined) {
		item.talentGrid[col] = [];
	    }

	    item.talentGrid[col][row] = {
		node: i,
		name: talentGridNode.steps[stepIndex].nodeStepName,
		icon: talentGridNode.steps[stepIndex].icon,
		isActivated: itemTalentNode.isActivated,
		progressPercent: itemTalentNode.progressPercent
	    };

	    item['talent_Col' + col + '_Row' + row + '_node'] = i;
	    item['talent_Col' + col + '_Row' + row + '_name'] = talentGridNode.steps[stepIndex].nodeStepName;
	    item['talent_Col' + col + '_Row' + row + '_icon'] = talentGridNode.steps[stepIndex].icon;
	    item['talent_Col' + col + '_Row' + row + '_isActivated'] = itemTalentNode.isActivated;
	    item['talent_Col' + col + '_Row' + row + '_progressPercent'] = itemTalentNode.progressPercent;
	}

	print_hash(item);
    }
}

function view_inventory(model) {
    const bucketToIgnoreList = [
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
    var i;
    var j;

    console.log("Start View Inventory");

    // Empty page content
    $( "#content" ).text('');

    view_header(model);

    if (model.currentStepNumber === 4 && model.currentStepProgress === 100) {
	// We can also use:
	// const character = model.getAccountSummary.characters;
	const character = model.getAllItemsSummary.characters;
	const mwcInventoryItem = DestinyMWC.DestinyInventoryItemDefinition;
	const mwcInventoryBucket = DestinyMWC.DestinyInventoryBucketDefinition;
	const mwcStat = DestinyMWC.DestinyStatDefinition;
	const mwcDamageType = DestinyMWC.DestinyDamageTypeDefinition;
	const mvcTalentGrid = DestinyMWC.DestinyTalentGridDefinition;
	const itemTypeRefList = [
	    3,  // Weapon
	    2,  // Armor
	];
	const armorSubTypeFromBucketType = {
	    4023194814: 0,  // Ghost Shell
	    3448274439: 1,  // Helmet
	    3551918588: 2, // Gauntlets
	    14239492: 3, // Chest Armor
	    20886954: 4, // Leg Armor
	    1585787867: 5,  // Class Armor (Hunter Cloak, Warlock Bond, Titan Mark)
	    434908299: 6 // Artifact
	};
	const armorSubTypeRefList = [
	    0,  // Ghost Shell
	    1,  // Helmet
	    2, // Gauntlets
	    3, // Chest Armor
	    4, // Leg Armor
	    5,  // Class Armor (Hunter Cloak, Warlock Bond, Titan Mark)
	    6 // Artifact
	];
	const weaponSubTypeRefList = [
	    6,  // Primary: Auto Rifle
	    9,  // Primary: Hand Cannon
	    13, // Primary: Pulse Rifle
	    14, // Primary: Scout Rifle
	    11, // Special: Fusion Rifle
	    7,  // Special: Shotgun
	    17, // Special: Sidearm
	    12, // Special: Sniper Rifle
	    8,  // Heavy:   Machine Gun
	    10, // Heavy:   Rocket Launcher
	    18 // Heavy:   Sword
	];

	// Getting info needed to size the number of columns
	// for each item type (autorifle, leg armor, etc.)
	var tableClassAndLabel = {};
	var statSize = {};
	var talentGridMaxRowByCol = {};
	for (i = 0; i < itemTypeRefList.length; i++) {
	    tableClassAndLabel[itemTypeRefList[i]] = {};
	    statSize[itemTypeRefList[i]] = {};
	    talentGridMaxRowByCol[itemTypeRefList[i]] = {};
	};
	for (i = 0; i < armorSubTypeRefList.length; i++) {
	    tableClassAndLabel[2][armorSubTypeRefList[i]] = {};
	    statSize[2][armorSubTypeRefList[i]] = 0;
	    talentGridMaxRowByCol[2][armorSubTypeRefList[i]] = [];
	};
	for (i = 0; i < weaponSubTypeRefList.length; i++) {
	    tableClassAndLabel[3][weaponSubTypeRefList[i]] = {};
	    statSize[3][weaponSubTypeRefList[i]] = 0;
	    talentGridMaxRowByCol[3][weaponSubTypeRefList[i]] = [];
	};
	for (i = 0; i < model.getAllItemsSummary.items.length; i++) {
	    const itemSummary = model.getAllItemsSummary.items[i];
	    const item = {};
	    item.instanceId = itemSummary.itemId;
	    item.hash = itemSummary.itemHash;
	    item.bucketTypeHash = (mwcInventoryItem[item.hash]).bucketTypeHash;
	    item.type = (mwcInventoryItem[item.hash]).itemType;
	    item.subType = (mwcInventoryItem[item.hash]).itemSubType;
	    item.typeName = (mwcInventoryItem[item.hash]).itemTypeName;
	    // Tier type: 4=>Rare, 5=>Legendary, 6=>Exotic
	    item.tierType = (mwcInventoryItem[item.hash]).tierType;

	    //Check if this item type is on the ignore list
	    if (model.bucketToIgnoreList.indexOf(String(item.bucketTypeHash)) > -1) {
	    	continue;
	    }

	    // Ignore everything except armor and weapon items
	    if ((item.type === 2) && (item.type === 3)) {
	    	continue;
	    }

	    // Ignore everything except exotic and legendary items
	    if ((item.tierType !== 5) && (item.tierType !== 6)) {
	    	continue;
	    }

	    // Apply a useful subtype to armor items
	    if (item.type === 2) { // Armor
		item.subType = armorSubTypeFromBucketType[item.bucketTypeHash];
	    }

	    // Use the generic type name not the class specific
	    if (item.bucketTypeHash === 1585787867) { // ClassArmor
		item.typeName = 'Class Armor';
	    }
	    if (item.bucketTypeHash === 434908299) { // ClassArmor
		item.typeName = 'Artifact';
	    }

	    const itemDetail = model.getItemDetail[item.instanceId];

	    tableClassAndLabel[item.type][item.subType].label = item.typeName;
	    tableClassAndLabel[item.type][item.subType].class = 'ItemType' + item.type + '_SubType'+ item.subType;

	    // Getting stats size for each slot (primary, special, heavy, etc.)
	    statSize[item.type][item.subType] = Math.max(statSize[item.type][item.subType],
							 itemDetail.item.stats.length);

	    // Getting talents grid size for each slot (primary, special, heavy, etc.)
	    item.talentGridHash = itemDetail.item.talentGridHash;
	    const talentGrid = (mvcTalentGrid[item.talentGridHash]);
	    const talentGridNodes = talentGrid.nodes;
	    item.talentNodes = itemDetail.talentNodes;
	    for (j = 0; j < talentGrid.nodes.length; j++) {
		const itemTalentNode = item.talentNodes[j];
		const talentGridNode = talentGridNodes[j];
		const row = talentGridNode.row;
		const col = talentGridNode.column;
		if (itemTalentNode.hidden === true) {
		    continue;
		}

		if (col < 0) {
		    console.log("WARNING: talentGridNode.column is %d for %s!", col, item.instanceId);
		}

		if (row < 0) {
		    console.log("WARNING: talentGridNode.row is %d for %s!", row, item.instanceId);
		}

		if (talentGridMaxRowByCol[item.type][item.subType][col] === undefined) {
		    talentGridMaxRowByCol[item.type][item.subType][col] = row;
		} else {
		    talentGridMaxRowByCol[item.type][item.subType][col] = Math.max(talentGridMaxRowByCol[item.type][item.subType][col], row);
		}
	    }
	}
	// console.log(tableClassAndLabel);
	// console.log(statSize);
	// console.log(talentGridMaxRowByCol);

	// Create table for each item type (autorifle, leg armor, etc.)
	for (i = 0; i < itemTypeRefList.length; i++) {
	    const SubTypeList = (itemTypeRefList[i] === 2) ? armorSubTypeRefList: weaponSubTypeRefList;
	    for (j = 0; j < SubTypeList.length; j++) {
		const itemType = itemTypeRefList[i];
		const itemSubType = SubTypeList[j];
		const talentGridSize = talentGridMaxRowByCol[itemType][itemSubType];
		//const targetClassId = (mwcInventoryBucket[itemType]).bucketIdentifier;
		//const targetClassName = (mwcInventoryBucket[itemType]).bucketName;
		const tableClass = tableClassAndLabel[itemType][itemSubType].class;
		const tableLabel = tableClassAndLabel[itemType][itemSubType].label;
		if( $('#content #' + tableClass).length === 0) {
		    $( '#content' )
			.append($('<h1>').text(tableLabel))
			.append($('<table>')
				.addClass('tablesorter')
				.attr('id', tableClass)
				.append($('<thead>').append($('<tr>')))
			       );
		    $('#content #' + tableClass + ' thead tr' )
			.append($('<th>').text('Bearer'))
			.append($('<th>').text('Icon'))
			.append($('<th>').text('Name'))
			.append($('<th>').text('Light'));

		    // Stats
		    if (itemType === 2) { // Armor
			$('#content #' + tableClass + ' thead tr' )
			    .append($('<th>').text((mwcStat["144602215"]).statName))   // Intellect
			    .append($('<th>').text((mwcStat["1735777505"]).statName))  // Discipline
			    .append($('<th>').text((mwcStat["4244567218"]).statName)); // Strength
		    } else { // Weapon
			if (itemSubType === 18) { // Sword
			    $('#content #' + tableClass + ' thead tr' )
				.append($('<th>').text((mwcStat["2837207746"]).statName)) // Speed
				.append($('<th>').text((mwcStat["4043523819"]).statName)) // Impact
				.append($('<th>').text((mwcStat["1240592695"]).statName)) // Range
				.append($('<th>').text((mwcStat["2762071195"]).statName)) // Efficiency
				.append($('<th>').text((mwcStat["209426660"]).statName))  // Defense
				.append($('<th>').text((mwcStat["925767036"]).statName)); // Energy
			} else if (itemSubType === 10) { // Rocket Launcher
			    $('#content #' + tableClass + ' thead tr' )
				.append($('<th>').text((mwcStat["4284893193"]).statName))  // Rate of Fire
				.append($('<th>').text((mwcStat["3614673599"]).statName))  // Blast Radius
				.append($('<th>').text((mwcStat["2523465841"]).statName))  // Velocity
				.append($('<th>').text((mwcStat["155624089"]).statName))   // Stability
				.append($('<th>').text((mwcStat["4188031367"]).statName))  // Reload
				.append($('<th>').text((mwcStat["3871231066"]).statName)); // Magazine
			} else if (itemSubType === 11) { // Fusion Rifle
			    $('#content #' + tableClass + ' thead tr' )
				.append($('<th>').text((mwcStat["2961396640"]).statName))  // Charge Rate
				.append($('<th>').text((mwcStat["4043523819"]).statName))  // Impact
				.append($('<th>').text((mwcStat["1240592695"]).statName))  // Range
				.append($('<th>').text((mwcStat["155624089"]).statName))   // Stability
				.append($('<th>').text((mwcStat["4188031367"]).statName))  // Reload
				.append($('<th>').text((mwcStat["3871231066"]).statName)); // Magazine
			} else { // Everything else
			    $('#content #' + tableClass + ' thead tr' )
				.append($('<th>').text((mwcStat["4284893193"]).statName))  // Rate of Fire
				.append($('<th>').text((mwcStat["4043523819"]).statName))  // Impact
				.append($('<th>').text((mwcStat["1240592695"]).statName))  // Range
				.append($('<th>').text((mwcStat["155624089"]).statName))   // Stability
				.append($('<th>').text((mwcStat["4188031367"]).statName))  // Reload
				.append($('<th>').text((mwcStat["3871231066"]).statName)); // Magazine
			}
		    }

		    // Talents
		    for (var t = 0; t < talentGridSize.length; t++) {
			$('#content #' + tableClass + ' thead tr' )
			    .append($('<th>')
				    .text('Talent Col ' + (t+1))
				    .attr('colspan', talentGridSize[t]+1)
				   );
		    }
		    $('#content #' + tableClass).append($('<tbody>'));
		}
	    }
	}

	for (i = 0; i < model.getAllItemsSummary.items.length; i++) {
	    const itemSummary = model.getAllItemsSummary.items[i];
	    const item = {};
	    item.instanceId = itemSummary.itemId;
	    item.hash = itemSummary.itemHash;
	    item.bucketTypeHash = (mwcInventoryItem[item.hash]).bucketTypeHash;
	    item.itemType = (mwcInventoryItem[item.hash]).itemType;
	    // Tier type: 4=>Rare, 5=>Legendary, 6=>Exotic
	    item.tierType = (mwcInventoryItem[item.hash]).tierType;

	    //Check if this item type is on the ignore list
	    if (model.bucketToIgnoreList.indexOf(String(item.bucketTypeHash)) > -1) {
	    	continue;
	    }
	    // Ignore engrams and foundry orders
	    if ((item.itemType === 8) || (item.itemType === 0)) {
	    	continue;
	    }
	    // Ignore everything except exotic and legendary items
	    if ((item.tierType !== 5) && (item.tierType !== 6)) {
	    	continue;
	    }

	    const itemDetail = model.getItemDetail[item.instanceId];
	    item.type = (mwcInventoryItem[item.hash]).itemType;
	    item.subType = (mwcInventoryItem[item.hash]).itemSubType;
	    item.typeName = (mwcInventoryItem[item.hash]).itemTypeName;
	    item.icon = (mwcInventoryItem[item.hash]).icon;
	    item.name = (mwcInventoryItem[item.hash]).itemName;
	    // Tier type Name => Rare, Legendary, Exotic and so on
	    item.tierTypeName = (mwcInventoryItem[item.hash]).tierTypeName;
	    item.bucketTypeIdentifier = (mwcInventoryBucket[item.bucketTypeHash]).bucketIdentifier;
	    item.bucketTypeName = (mwcInventoryBucket[item.bucketTypeHash]).bucketName;

	    // Character index : 0, 1 or 2 for a character / -1 for the vault
	    item.characterIndex = itemSummary.characterIndex;
	    if (item.characterIndex !== -1) {
		item.characterEmblemIcon = (character[item.characterIndex]).emblemPath;
	    } else {
		item.characterEmblemIcon = "/img/theme/destiny/icons/icon_vault.png";
	    }

	    //item.summaryJson = JSON.stringify(itemSummary, null, 4);

	    // Tell if item has been maxed out or not
	    item.isGridComplete = itemSummary.isGridComplete;
	    item.damageTypeHash = itemSummary.damageTypeHash;
	    if (item.damageTypeHash !== 0) {
		item.damageTypeName = (mwcDamageType[item.damageTypeHash ]).DamageTypeName;
		item.damageTypeIcon = (mwcDamageType[item.damageTypeHash ]).iconPath;
		item.damageTypeShowIcon = (mwcDamageType[item.damageTypeHash ]).showIcon;
	    }
	    if ('primaryStat' in itemSummary) {
		item.primaryStatHash = itemSummary.primaryStat.statHash;
		item.primaryStatValue = itemSummary.primaryStat.value;
		// Just says Attack or Defense...
		item.primaryStatName = (mwcStat[item.primaryStatHash]).statName;
		// Icon is useless
		item.primaryStatIcon = (mwcStat[item.primaryStatHash]).icon;
	    }

	    // Getting Stats
	    item.stats = {};
	    for (j = 0; j < itemDetail.item.stats.length; j++) {
		const stats = itemDetail.item.stats[j];
		item.stats[stats.statHash] = stats.value;
	    }

	    // Getting talents
	    item.talentGrid = [];
	    item.talentGridHash = itemDetail.item.talentGridHash;
	    const talentGrid = (mvcTalentGrid[item.talentGridHash]);
	    const talentGridNodes = talentGrid.nodes;
	    item.talentNodes = itemDetail.talentNodes;
	    for (j = 0; j < talentGrid.nodes.length; j++) {
		const itemTalentNode = item.talentNodes[j];
		const talentGridNode = talentGridNodes[j];
		const row = talentGridNode.row;
		const col = talentGridNode.column;
		const stepIndex = itemTalentNode.stepIndex;
		if (itemTalentNode.hidden === true) {
		    continue;
		}

		if (col < 0) {
		    console.log("WARNING: talentGridNode.column is %d for %s!", col, item.instanceId);
		}

		if (row < 0) {
		    console.log("WARNING: talentGridNode.row is %d for %s!", row, item.instanceId);
		}

		if (item.talentGrid[col] === undefined) {
		    item.talentGrid[col] = [];
		}

		item.talentGrid[col][row] = {
		    node: j,
		    name: talentGridNode.steps[stepIndex].nodeStepName,
		    description: talentGridNode.steps[stepIndex].nodeStepDescription,
		    icon: talentGridNode.steps[stepIndex].icon,
		    isActivated: itemTalentNode.isActivated,
		    progressPercent: itemTalentNode.progressPercent,
		    hidden: itemTalentNode.hidden
		};
	    }

	    // Create row to insert
	    if (item.type === 2) { // Armor
		// Fix item subtype for armor items
		item.subType = armorSubTypeFromBucketType[item.bucketTypeHash];
	    }
	    const row = $('<tr>').attr('id', item.instanceId);
	    row.append($('<td>').append($('<img/>', {
		src: "https://www.bungie.net" + item.characterEmblemIcon,
		alt: "CharacterEmblemIcon"
	    })));
	    row.append($('<td>')
		       .addClass('itemIcon')
		       .append($('<img/>', {
			   src: "https://www.bungie.net" + item.icon,
			   alt: "ItemIcon",
			   title: item.instanceId + '/' + item.hash
		       }))
		       .append('<br>' + '<progress value="' + (item.isGridComplete ? 100 : 0) + '" max="100">'
			       + (item.isGridComplete ? 100 : 0) + '</progress>'
			      )
		      );
	    row.append($('<td>').text(item.name));
	    //row.append($('<td>').text(item.typeName));
	    if ('primaryStat' in itemSummary) {
		if (item.damageTypeHash === 3454344768) { // Void
		    row.append($('<td>')
			       .addClass('damageVoid')
			       .text(item.primaryStatValue));
		} else if (item.damageTypeHash === 2303181850) { // Arc
		    row.append($('<td>')
			       .addClass('damageArc')
			       .text(item.primaryStatValue));
		} else if (item.damageTypeHash === 1847026933) { // Solar
		    row.append($('<td>')
			       .addClass('damageSolar')
			       .text(item.primaryStatValue));
		} else {
		    row.append($('<td>')
			       .addClass('damageKinetic')
			       .text(item.primaryStatValue));
		}
	    }

	    if (item.type === 2) { // Armor
		row
		    .append($('<td>').text(item.stats["144602215"]))   // Intellect
		    .append($('<td>').text(item.stats["1735777505"]))  // Discipline
		    .append($('<td>').text(item.stats["4244567218"])); // Strength
	    } else { // Weapon
		if (item.subType === 18) { // Sword
		    row
			.append($('<td>').text(item.stats["2837207746"])) // Speed
			.append($('<td>').text(item.stats["4043523819"])) // Impact
			.append($('<td>').text(item.stats["1240592695"])) // Range
			.append($('<td>').text(item.stats["2762071195"])) // Efficiency
			.append($('<td>').text(item.stats["209426660"]))  // Defense
			.append($('<td>').text(item.stats["925767036"])); // Energy
		} else if (item.subType === 10) { // Rocket Launcher
		    row
			.append($('<td>').text(item.stats["4284893193"]))  // Rate of Fire
			.append($('<td>').text(item.stats["3614673599"]))  // Blast Radius
			.append($('<td>').text(item.stats["2523465841"]))  // Velocity
			.append($('<td>').text(item.stats["155624089"]))   // Stability
			.append($('<td>').text(item.stats["4188031367"]))  // Reload
			.append($('<td>').text(item.stats["3871231066"])); // Magazine
		} else if (item.subType === 11) { // Fusion Rifle
		    row
			.append($('<td>').text(item.stats["2961396640"]))  // Charge Rate
			.append($('<td>').text(item.stats["4043523819"]))  // Impact
			.append($('<td>').text(item.stats["1240592695"]))  // Range
			.append($('<td>').text(item.stats["155624089"]))   // Stability
			.append($('<td>').text(item.stats["4188031367"]))  // Reload
			.append($('<td>').text(item.stats["3871231066"])); // Magazine
		} else { // Everything else
		    row
			.append($('<td>').text(item.stats["4284893193"]))  // Rate of Fire
			.append($('<td>').text(item.stats["4043523819"]))  // Impact
			.append($('<td>').text(item.stats["1240592695"]))  // Range
			.append($('<td>').text(item.stats["155624089"]))   // Stability
			.append($('<td>').text(item.stats["4188031367"]))  // Reload
			.append($('<td>').text(item.stats["3871231066"])); // Magazine
		}
	    }

	    var talentCol, talentRow;
	    for (talentCol = 0; talentCol < talentGridMaxRowByCol[item.type][item.subType].length; talentCol++) {
		for (talentRow = 0; talentRow < talentGridMaxRowByCol[item.type][item.subType][talentCol]+1; talentRow++) {
		    if (item.talentGrid[talentCol] === undefined) {
			row.append($('<td>')).addClass('talent');
			continue;
		    }
		    const talent = item.talentGrid[talentCol][talentRow];
		    if (talent === undefined) {
			row.append($('<td>')).addClass('talent');
		    } else {
			var talentProgressPercent = Math.floor(talent.progressPercent);
			row.append($('<td>').addClass('talent')
				   .append($('<div>')
					   .addClass('talentLine1')
					   .append($('<img/>', {
					       src: "https://www.bungie.net" + talent.icon,
					       alt: "Icon for " + talent.name,
					       title: talent.description
					   })))
				   .append($('<div>')
					   .addClass('talentLine2')
					   .append($('<span>').text(talent.name)))
				   .append($('<div>')
					   .addClass('talentLine3')
					   .append($('<progress>', {
					       value: talentProgressPercent,
					       max: 100
					   }).text(talentProgressPercent)))
				  );
		    }
		}
	    }

	    //row.append($('<td>').text(item.summaryJson));

	    // Insert a row in the right table
	    const tableClass = tableClassAndLabel[item.type][item.subType].class;
	    $('#content #' + tableClass + ' tbody').append(row);
	}

	for (i = 0; i < itemTypeRefList.length; i++) {
	    const SubTypeList = (itemTypeRefList[i] === 2) ? armorSubTypeRefList: weaponSubTypeRefList;
	    for (j = 0; j < SubTypeList.length; j++) {
		const itemType = itemTypeRefList[i];
		const itemSubType = SubTypeList[j];
		const tableClass = tableClassAndLabel[itemType][itemSubType].class;
		const tableLabel = tableClassAndLabel[itemType][itemSubType].label;
		$('#content #' + tableClass).tablesorter();
	    }
	}
    }
}

function view_characters(model) {
    const displayName = settings.displayName;
    const membershipType = settings.membershipType;
    const ignoreCase = settings.ignoreCase;
    var i;
    var j;

    view_header(model);

    if (model.currentStepNumber === 2 && model.currentStepProgress === 100) {
	for (i = 0; i < model.getAccountSummary.characters.length; i++) {
	    const character = model.getAccountSummary.characters[i];
	    const characterClass = ".character" + i;
	    const DestinyClassDefinition = DestinyMWC.DestinyClassDefinition;
	    const className = (DestinyMWC.DestinyClassDefinition[character.characterBase.classHash]).className;

	    $( characterClass + " .emblemPath" ).attr("src", "https://www.bungie.net" + character.emblemPath);
	    $( characterClass + ".backgroundPath").attr("style", "background-image: url(https://www.bungie.net" + character.backgroundPath + ")");
	    $( characterClass + " .className" ).html(className);
	    $( characterClass + " .characterLevel" ).html(character.characterLevel);
	    $( characterClass + " .powerLevel" ).html(character.characterBase.powerLevel);

	    $( characterClass + " .characterId" ).html(character.characterBase.characterId);
	    $( characterClass + " .statDefenseValue" ).html(character.characterBase.stats.STAT_DEFENSE.value);
	    $( characterClass + " .statIntellectValue" ).html(character.characterBase.stats.STAT_INTELLECT.value);
	    $( characterClass + " .statDisciplineValue" ).html(character.characterBase.stats.STAT_DISCIPLINE.value);
	    $( characterClass + " .statStrengthValue" ).html(character.characterBase.stats.STAT_STRENGTH.value);
	    $( characterClass + " .statLightValue" ).html(character.characterBase.stats.STAT_LIGHT.value);
	    $( characterClass + " .statArmorValue" ).html(character.characterBase.stats.STAT_ARMOR.value);
	    $( characterClass + " .statAgilityValue" ).html(character.characterBase.stats.STAT_AGILITY.value);
	    $( characterClass + " .statRecoveryValue" ).html(character.characterBase.stats.STAT_RECOVERY.value);
	    $( characterClass + " .statOpticsValue" ).html(character.characterBase.stats.STAT_OPTICS.value);

	    for (j = 0; j < character.characterBase.peerView.equipment.length; j++) {
		const equipment = character.characterBase.peerView.equipment[j];
		const equipmentClass = ".equipment" + j;
		const equipmentIcon = (DestinyMWC.DestinyInventoryItemDefinition[equipment.itemHash]).icon;
		const equipmentName = (DestinyMWC.DestinyInventoryItemDefinition[equipment.itemHash]).itemName;
		$( equipmentClass + characterClass + " .itemName" ).html(equipmentName);
		$( equipmentClass + characterClass + " .itemIcon" ).attr("src", "https://www.bungie.net" + equipmentIcon);
	    }
	}
    }
}
