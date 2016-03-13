#!/usr/bin/nodejs

var http = require('http');
var https = require('https');
var sys  = require('sys');
var fs   = require('fs');

var BUNGIE = {
    host: 'www.bungie.net',
    port: 443
};

http.createServer(function(request, response) {
    var ip = request.connection.remoteAddress;

    sys.log(ip + ": " + request.method + " " + request.url);

    var proxy = http.createClient(80, request.headers['host']);
    var proxy_request = proxy.request(request.method, request.url, request.headers);

    proxy_request.addListener('response', function(proxy_response) {
	proxy_response.addListener('data', function(chunk) {
	    response.write(chunk, 'binary');
	});
	proxy_response.addListener('end', function() {
	    response.end();
	});
	response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    request.addListener('data', function(chunk) {
	proxy_request.write(chunk, 'binary);
  });
  request.addListener('end', function() {
    proxy_request.end();
  });
}).listen(8080);
