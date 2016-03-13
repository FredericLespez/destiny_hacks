#!/usr/bin/python

import os
import logging
import json
import requests
import time
# https://urllib3.readthedocs.org/en/latest/security.html#insecurerequestwarning
# requests.packages.urllib3.disable_warnings()

#
# Log into Bungie platform through PSN
# Based on code by Quantum Ascend[
# http://bungienetplatform.wikia.com/wiki/Authentication#PSN_Auth_with_Python.2FRequests
#

import getpass
import subprocess

from base64 import b64encode
from urlparse import urlparse

import httplib
httplib.HTTPConnection.debuglevel = 0

def log_into_bungie_with_psn_id(username, password):
    logger = logging.getLogger(__name__)

    BUNGIE_SIGNIN_URI = "https://www.bungie.net/en/User/SignIn/Psnid"
    PSN_OAUTH_URI = "https://auth.api.sonyentertainmentnetwork.com/login.do"

    logger.debug("Logging in...")

    # Get JSESSIONID cookie.
    # We follow the redirection just in case the URI ever changes.
    get_jessionid = requests.get(BUNGIE_SIGNIN_URI, allow_redirects=True)
    jsessionid0 = get_jessionid.history[1].cookies["JSESSIONID"]
    logger.debug("JSESSIONID: %s", jsessionid0)

    # The POST request will fail if the field `params` isn't present
    # in the body of the request.
    # The value is just the query string of the PSN login page
    # encoded in base64.
    params = urlparse(get_jessionid.url).query
    logger.debug("params: %s", params)
    params64 = b64encode(params)
    logger.debug("params64: %s", params64)

    # Post credentials and pass the JSESSIONID cookie.
    # We get a new JSESSIONID cookie.
    # Note: It doesn't appear to matter what the value of `params` is, but
    # we'll pass in the appropriate value just to be safe.
    post = requests.post(
        PSN_OAUTH_URI,
        data={"j_username": username, "j_password": password, "params": params64},
        cookies={"JSESSIONID": jsessionid0},
        allow_redirects=False
    )
    if "authentication_error" in post.headers["location"]:
        logger.warning("Invalid credentials")
    jsessionid1 = post.cookies["JSESSIONID"]
    logger.debug("JSESSIONID: %s", jsessionid1)

    # Follow the redirect from the previous request passing in the new
    # JSESSIONID cookie. This gets us the x-np-grant-code to complete
    # the sign-in with Bungie.
    get_grant_code = requests.get(
        post.headers["location"],
        allow_redirects=False,
        cookies={"JSESSIONID": jsessionid1}
    )
    grant_code = get_grant_code.headers["x-np-grant-code"]
    logger.debug("x-np-grant-code: %s", grant_code)

    # Finish our sign-in with Bungie using the grant code.
    auth_cookies = requests.get(BUNGIE_SIGNIN_URI,
                                params={"code": grant_code})

    # Only expiration time for bungleatk cookie counts
    expires = next(x for x in auth_cookies.cookies if x.name == 'bungleatk').expires
    logger.debug("bungleatk expires: %s", time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(expires)))
    logger.debug("bungleatk: %s", auth_cookies.cookies["bungleatk"])
    logger.debug("bungled: %s", auth_cookies.cookies["bungled"])
    logger.debug("bungledid: %s", auth_cookies.cookies["bungledid"])

    return { "bungled": auth_cookies.cookies["bungled"],
             "bungleatk": auth_cookies.cookies["bungleatk"],
             "bungledid": auth_cookies.cookies["bungledid"],
             "expires": expires,
    }

#
# Convert the Destiny mobile world content into a JSON file (wrapped into a Javascript object)
# Based on code by xIntangible
# http://bungienetplatform.wikia.com/wiki/Manifest#Python
#

import zipfile
import sqlite3
#import pickle #Optional

# Can be: en, fr, es, de, it, ja, pt-br
lang = 'en'
weapon_types = ['Rocket Launcher', 'Scout Rifle', 'Fusion Rifle', 'Sniper Rifle',
                'Shotgun', 'Machine Gun', 'Pulse Rifle', 'Auto Rifle', 'Hand Cannon', 'Sidearm']

#dictionary that tells where to get the hashes for each table
#FULL DICTIONARY
hash_dict = {
    'DestinyActivityBundleDefinition': 'bundleHash',
    'DestinyActivityDefinition': 'activityHash',
    'DestinyActivityTypeDefinition': 'activityTypeHash',
#    'DestinyBondDefinition': 'hash',
    'DestinyClassDefinition': 'classHash',
    'DestinyDamageTypeDefinition': 'damageTypeHash',
    'DestinyDestinationDefinition': 'destinationHash',
    'DestinyDirectorBookDefinition': 'bookHash',
    'DestinyEnemyRaceDefinition': 'raceHash',
    'DestinyFactionDefinition': 'factionHash',
    'DestinyGenderDefinition': 'genderHash',
    'DestinyGrimoireCardDefinition': 'cardId',
#    'DestinyGrimoireDefinition': '????',
    'DestinyHistoricalStatsDefinition': 'statId',
    'DestinyInventoryBucketDefinition': 'bucketHash',
    'DestinyInventoryItemDefinition': 'itemHash',
    'DestinyItemCategoryDefinition': 'itemCategoryHash',
#    'DestinyLocationDefinition': 'locationHash',
#    'DestinyObjectiveDefinition': 'objectiveHash',
    'DestinyPlaceDefinition': 'placeHash',
    'DestinyProgressionDefinition': 'progressionHash',
    'DestinyRaceDefinition': 'raceHash',
#    'DestinyRecordBookDefinition': '????',
#    'DestinyRecordDefinition': 'hash',
#    'DestinyRewardSourceDefinition': 'sourceHash',
    'DestinySandboxPerkDefinition': 'perkHash',
    'DestinyScriptedSkullDefinition': 'skullHash',
    'DestinySpecialEventDefinition': 'eventHash',
    'DestinyStatDefinition': 'statHash',
    'DestinyStatGroupDefinition': 'statGroupHash',
    'DestinyTalentGridDefinition': 'gridHash',
#    'DestinyTriumphSetDefinition': 'triumphSetHash',
    'DestinyUnlockFlagDefinition': 'flagHash',
    'DestinyVendorCategoryDefinition': 'categoryHash',
#    'DestinyVendorDefinition': '????',
}

def get_mobile_world_content_file(mobile_world_content_file, api_key, lang):
    manifest_local_version_file = 'destiny_manifest_version.txt'
    manifest_url = 'http://www.bungie.net/Platform/Destiny/Manifest/'
    mobile_world_content_file_zipped = mobile_world_content_file + '.zip'
    updated = False

    # Load local Destiny manifest version
    if os.path.isfile(manifest_local_version_file) == True:
        with open(manifest_local_version_file,'r') as f:
            manifest_local_version = unicode(f.read().rstrip('\n'))
        logger.debug("Local Destiny manifest version is %s", manifest_local_version)
    else:
        manifest_local_version = "0"

    # Get Destiny manifest
    logger.debug("Get Destiny manifest")
    custom_headers = { 'X-API-Key': api_key }
    r = requests.get(manifest_url, headers=custom_headers)
    manifest = r.json()
    manifest_version = manifest['Response']['version']
    logger.debug("Destiny manifest version is %s", manifest_version)

    # Find the mobile world content url from manifest
    mobile_world_content_url = 'http://www.bungie.net' + manifest['Response']['mobileWorldContentPaths'][lang]
    logger.debug("Mobile world content [%s] url is %s", lang, mobile_world_content_url)

    # Check if Destiny Manifest has been updated
    if manifest_version == manifest_local_version:
        updated = False
        logger.debug("Destiny manifest has not been updated")
        return updated
    else:
        updated = True
        with open(manifest_local_version_file,'w') as f:
            f.write(manifest_version)
            f.write('\n')
        logger.debug("Destiny manifest has been updated")

    # Download the mobile world content file
    logger.debug("Downloading mobile world content into file %s", mobile_world_content_file_zipped)
    r = requests.get(mobile_world_content_url)
    with open(mobile_world_content_file_zipped, "wb") as zip:
        zip.write(r.content)
    logger.debug("Download Complete!")

    #Extract the file contents, and rename the extracted file
    # to 'Manifest.content'
    logger.debug("Extract mobile world content zipped file %s", mobile_world_content_file_zipped)
    with zipfile.ZipFile(mobile_world_content_file_zipped) as zip:
        output_filename_lists = zip.namelist()
        zip.extractall()
    os.rename(output_filename_lists[0], mobile_world_content_file)
    logger.debug('Done!')

    return updated

def build_dict(mobile_world_content_file, lang, hash_dict):

    # Connect to Destiy mobile world content SQLite database
    logger.debug("Connect to Destiy mobile world content SQLite database %s", mobile_world_content_file)
    con = sqlite3.connect(mobile_world_content_file)
    logger.debug("Connected!")

    # Create a cursor object
    cur = con.cursor()

    mobile_world_content_dict = {}
    # For every table name in the dictionary
    for table_name in hash_dict.keys():
        # Get a list of all the JSONs from the table
        cur.execute('SELECT json from ' + table_name)
        logger.debug("Generating %s dictionary...", table_name)

        # This returns a list of tuples: the first item in each tuple is our json
        items = cur.fetchall()

        # Create a list of JSONs
        item_jsons = [json.loads(item[0]) for item in items]

        # Create a dictionary with the hashes as keys and the JSONs as values
        item_dict = {}
        table_hash = hash_dict[table_name]
        for item in item_jsons:
            item_dict[item[table_hash]] = item

        # Add that dictionary to our mobile_world_content_dict using the name of the table
        #as a key.
        mobile_world_content_dict[table_name] = item_dict

    logger.debug("Full dictionary generated!")
    return mobile_world_content_dict

if __name__ == '__main__':
    # logging.basicConfig(level=logging.DEBUG)
    logging.basicConfig(level=logging.INFO)
    logging.captureWarnings(True)
    ul3_logger = logging.getLogger("requests.packages.urllib3")
    ul3_logger.setLevel(logging.WARN)

    logger = logging.getLogger(__name__)
    settings = {}
    settings_file = "bootstrap_settings.json"

    print "Load settings from file " + settings_file
    with open(settings_file, 'r') as data:
        settings = json.load(data)

    #
    # Get Destiny mobile world content
    #
    lang = settings['lang']
    mobile_world_content_base = 'Mobile_World_Content.' + lang
    mobile_world_content_file = mobile_world_content_base + '.sqlite'
    mobile_world_content_file_js = mobile_world_content_base + '.js'
    mobile_world_content_dict = {}

    print 'Get Destiny Mobile World Content file ' + mobile_world_content_file
    updated = get_mobile_world_content_file(mobile_world_content_file, settings['apiKey'], lang)

    if updated:
        print 'Destiny Manifest has been updated'
        print 'Load Destiny Mobile World Content into a dictionary'
        mobile_world_content_dict = build_dict(mobile_world_content_file, lang, hash_dict)

        print 'Save Destiny Mobile World Content into a javascript object file ' + mobile_world_content_file_js
        with open(mobile_world_content_file_js, 'w') as f:
            f.write('DestinyMWC = ')
            # Compact but not human readable
            json.dump(mobile_world_content_dict, f)
            # Bigger but human readable
            #json.dump(mobile_world_content_dict, f, sort_keys=True, indent=4, separators=(',', ': '))
            f.write('\n')
        print "File '" + mobile_world_content_file_js + "' is ready to use!"
    else:
        print 'Destiny Manifest has not been updated'
        print "File '" + mobile_world_content_file_js + "' is ready to use!"

    #
    # Log into Bungie platform through PSN and start proxy
    #
    bungie_api_key = {}
    bungie_auth_cookies = {}
    bungie_auth_cookies_file = "bungie_auth_cookies.json"
    need_log_in = False

    if os.path.isfile(bungie_auth_cookies_file) == False:
        need_log_in = True
    else:
        print "Load Bungie authentification cookies from file " + bungie_auth_cookies_file
        print "Remove this file and restart this program to log in again"
        with open(bungie_auth_cookies_file, 'r') as f:
            bungie_auth_cookies = json.load(f)
        logger.debug("cookies: bungled %s / bungleatk %s / bungledid %s",
                     bungie_auth_cookies['bungled'],
                     bungie_auth_cookies['bungleatk'],
                     bungie_auth_cookies['bungledid'],
                     bungie_auth_cookies['expires'],
        )
        if (bungie_auth_cookies['expires'] < int(time.time())):
            print "Bungie authentification cookies expired. Need to log in again"
            need_log_in = True

    if (need_log_in):
        print "Log on Bungie platform through PSN..."
        username = None
        password = None

        while not username:
            username = raw_input("Enter Username: ")
        while not password:
            password = getpass.getpass("Enter Password: ")

        bungie_auth_cookies = log_into_bungie_with_psn_id(username, password)

        logger.debug("cookies: %s / %s / %s",
                     bungie_auth_cookies['bungled'],
                     bungie_auth_cookies['bungleatk'],
                     bungie_auth_cookies['bungledid'],
                     bungie_auth_cookies['expires'],
        )

        print "Save Bungie authentification cookies into file " + bungie_auth_cookies_file
        print "Remove this file to log in again"
        with open(bungie_auth_cookies_file, 'w') as f:
            json.dump(bungie_auth_cookies, f, sort_keys=True, indent=4, separators=(',', ': '))
            f.write('\n')

    print "Run local proxy for Bungie platform access"
    proxy_args = ["9000",
                  settings['apiKey'],
                  bungie_auth_cookies['bungled'],
                  bungie_auth_cookies['bungleatk'],
                  bungie_auth_cookies['bungledid']
    ];
    if ('proxyUrl' in settings):
        proxy_args.append(settings['proxyUrl'])

    subprocess.call(["./proxy.js"] + proxy_args)
