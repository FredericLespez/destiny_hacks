#!/usr/bin/nodejs

// Code from: https://github.com/waltfy/destiny/blob/develop/proxy.js

/**
 * Super hacky proxy server
 *
 * $ chmod +x proxy
 * $ ./proxy 9000 or $ node proxy.js 9000
 */
var https = require('https');
var http = require('http');
var https_proxy_agent;

var bungieUrl= {
    host: 'www.bungie.net',
    port: 443
};

var listen_port = process.argv[2];
var api_key = process.argv[3];
var cookie_bungled_val = process.argv[4];
var cookie_bungleatk_val = process.argv[5];
var cookie_bungledid_val = process.argv[6];
var use_proxy = false;
var proxy_url = 'None';
var agent;
if (process.argv.length === 8) {
    use_proxy = true;
    proxy_url = process.argv[7];
    https_proxy_agent = require('https-proxy-agent');
    agent = new https_proxy_agent(proxy_url);
}

function copyHeaderFrom(source) {
    return function (target, k) {
	if (typeof target[k.toLowerCase()] === 'undefined') {
	    target[k] = source[k];
	}
	return target;
    };
}

http.createServer(function (req, res) {

    var outboundData = {
	method: req.method,
	host: bungieUrl.host,
	port: bungieUrl.port,
	path: req.url,
	headers: req.headers
    };

    if (use_proxy) {
	outboundData.agent = agent;
    }

    outboundData.headers.host = bungieUrl.host;

    // console.log('outbound request ========================');
    // console.log(outboundData);

    if (outboundData.method === 'OPTIONS') {
	res.writeHead(200, {
	    'Access-Control-Allow-Origin': '*',
	    'Access-Control-Allow-Headers': outboundData.headers['access-control-request-headers'] || ''
	});
	return res.end();
    }

    console.log('Request %s %s', outboundData.method, outboundData.path);

    outboundData.headers["cookie"] = 'bungled=' + cookie_bungled_val +
	'; bungleatk=' + cookie_bungleatk_val +
	'; bungledid=' + cookie_bungledid_val +
	'; path=/; domain=www.bungie.net';
    outboundData.headers["x-api-key"] = api_key;
    outboundData.headers["x-csrf"] = cookie_bungled_val;

    https.request(outboundData, function (bungieRes) {
	var initialHeaders = {
	    'access-control-allow-origin': '*',
	    'origin': outboundData.headers.origin
	};
	res.writeHead(
	    bungieRes.statusCode,
	    Object.keys(bungieRes.headers).reduce(copyHeaderFrom(bungieRes.headers), initialHeaders)
	);
	bungieRes.pipe(res);
    }).end();

}).listen(listen_port, function () {
    console.log('Bungie Proxy Server running on port %s', this.address().port);
    // console.log('API key: %s', api_key);
    // console.log('Cookie bungled value: %s', cookie_bungled_val);
    // console.log('Cookie bungleatk value: %s', cookie_bungleatk_val);
    // console.log('Cookie bungledid value: %s', cookie_bungledid_val);
    // console.log('Proxy: %s', proxy_url);
});
