# destiny-myapp

Hacky experiments !
Use at your own risks !

##Packages needed
###Debian
python-requests
nodejs
nodejs https-proxy-agent

##Useful links

##CSS Magic
CSS Percentage Circle http://circle.firchow.net/

###API Enpoint

http://bungienetplatform.wikia.com/wiki/Endpoints
http://bungienetplatform.wikia.com/wiki/Category:PublicEndpoint
http://bungienetplatform.wikia.com/wiki/Category:PrivateEndpoint
http://bungienetplatform.wikia.com/wiki/Category:DestinyService
https://www.bungie.net/platform/destiny/help/


####Full inventory
http://bungienetplatform.wikia.com/wiki/GetVault
https://www.bungie.net/platform/destiny/%7Bmembershiptype%7D/myaccount/vault/
https://www.bungie.net/Platform/Destiny/2/MyAccount/Vault/?accountId=4611686018428939884

GetAllItemsSummary

###Determining item type (primary, special, helmet, etc.) ?
https://www.bungie.net/en/Clan/Post/39966/105365352/0/0


###PSN login
https://www.bungie.net/en/Clan/Post/39966/106896643/0/0
http://bungienetplatform.wikia.com/wiki/Authentication
https://github.com/dazarobbo/BNextNotifier/blob/333d3dc498f3ee9642c24fe1ebe43b8f4a234095/scripts/BungieNet.js

http://www.rickdeman.nl/platform/destiny/apitest.php
https://github.com/waltfy/destiny/blob/develop/proxy.js
http://www.catonmat.net/http-proxy-in-nodejs/
https://www.bungie.net/en/Forum/Post/68669766/0/0

###Xur
https://www.reddit.com/r/DestinyTheGame/comments/2if2vh/x%C3%BBr_times_location_from_bungie/

###Item type, subtype et classtype
https://www.bungie.net/en/Clan/Post/39966/105365352/0/0
enum DestinyItemType
{
None = 0,
Currency = 1,
Armor = 2,
Weapon = 3,
Bounty = 4,
CompletedBounty = 5,
BountyReward = 6,
Message = 7,
Engram = 8,
Consumable = 9,
ExchangeMaterial = 10,
MissionReward = 11
}

enum DestinyItemSubType
{
None = 0,
Crucible = 1,
Vanguard = 2,
IronBanner = 3,
Queen = 4,
Exotic = 5,
AutoRifle = 6,
Shotgun = 7,
Machinegun = 8,
Hand Cannon = 9,
Rocket Launcher = 10,
Fusion Rifle = 11,
Sniper Rifle = 12,
Pulse Rifle = 13,
Scout Rifle = 14,
Camera = 15,
Message from Special Orders = 16,
Sidearm = 17,
Sword = 18,
Mask = 19,

}

enum DestinyClass
{
Titan = 0,
Hunter = 1,
Warlock = 2,
Unknown = 3
}

SpecialItemType
{
None = 0,
SpecialCurrency = 1,
CompletedBounty = 2,
CrucibleBounty = 3,
VanguardBounty = 4,
IronBannerBounty = 5,
QueenBounty = 6,
ExoticBounty = 7,
Armor = 8,
Weapon = 9,
Engram = 23,
Consumable = 24,
ExchangeMaterial = 25,
MissionReward = 27,
BountyReward = 28,
Currency = 29
}
