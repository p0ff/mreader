var nw = require('nw.gui');
var fs = require('fs');
var req = require("request");
var mkdirp = require("mkdirp");
var cheerio = require("cheerio");
var cwr = function(str) {
	process.stdout.write(str);
}