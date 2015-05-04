function getWebPage(url, callback, errback) {
	req({
		uri: url
	}, function(err, res, body) {
		if(err == null)
			callback(body);
		else if(errback != undefined)
			errback(err);
	});
}
function getChapterList(url, callback) {
	getWebPage(url, function(body) {
		var $ = cheerio.load(body),
			chlist = new Array();
		$("#chapters .chlist .tips").each(function(i, obj) {
			chlist.unshift(obj.attribs.href);
		});
		callback(chlist);
	});
}
function dlImg(url, path, callback) {
	cwr("\r                                                                                                                                    \r" + path);
	req.head(url, function(err, res, body) {
	    if(res.headers['content-type'] == "image/jpeg")
	    	path += ".jpg";
	    req(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
}
function writeData(data, path, callback) {
	fs.writeFile(path + "/data.json", JSON.stringify(data, null, 4), callback);
}
function downloadRest(data, i, num, path, url, ch, callback) {
	if(i == num) {
		callback();
		return;
	}
	getWebPage(url, function(body) {
		var $ = cheerio.load(body);
		var img = $("#image")[0].attribs.src;
		dlImg(img, path + "/" + i, function() {
			var temp = url.split("/");
			temp.pop();
			temp.push($(".next_page")[0].attribs.href);
			data.downloaded[ch]++;
			var dir = path.split("/");
			dir.pop();
			writeData(data, dir.join("/"), function() {
				downloadRest(data, +i+1, num, path, temp.join("/"), ch, callback);
			});
			return;
		});
	});
}
function getChapter(data, dir, i, url, callback) {
	var path = dir + "/chapter_" + i;
	mkdirp(path, function(err) {
		getWebPage(url, function(body) {
			var $ = cheerio.load(body);
			var pages = parseInt($(".l")[0].children[2].data.trim().slice(3));
			data.chapters[i] = pages;
			var firstImg = $("#image")[0].attribs.src;
			dlImg(firstImg, path + "/0", function() {
				data.downloaded[i] = 1;
				var temp = url.split("/");
				temp.pop();
				temp.push($(".next_page")[0].attribs.href);
				downloadRest(data, 1, pages, path, temp.join("/"), i, function() {
					callback();
					return;
				});
			});
		});
	});
}
function chGet(data, path, i, list, callback) {
	if(i > list.length) {
		callback(); 
		return;
	}
	getChapter(data, path, i, list[i], function(err) {
		chGet(data, path, +i+1, list, callback);
	});
}
function dwd(path, data) {
	var flag = 1;
	getChapterList("http://mangafox.me/manga/" + path.path, function(list) {
		data.len = list.length;
		for(var i = 0; i < data.downloaded.length; ++i) {
			if(data.downloaded[i] < data.chapters[i]) {
				flag = 0;
				chGet(data, "library/" + path.path, i, list, function() {
					console.log("done");
				});
			}
		}
		if(flag == 1 && data.downloaded.length < list.length) {
			chGet(data, "library/" + path.path, data.downloaded.length, list, function() {
				console.log("done");
			});
		}
	});
}
function download(path) {
	fs.readFile("library/" + path.path + "/data.json", function(err, data) {
		if(err) {
			mkdirp("library/" + path.path, function(err) {
				var temp = new Object();
				temp.len = 0;
				temp.chapters = new Array();
				temp.downloaded = new Array();
				dwd(path, temp);
			});
		}
		else {
			dwd(path, JSON.parse(data));
		}
	})
}