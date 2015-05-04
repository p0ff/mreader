function init() {
	fs.readFile("lib.json", function(err, data) {
		if(err) {
			cwr(err);
		} else {
			var lib = JSON.parse(data);
			$("body").append("<ul id=\"list\"></ul>");
			for(var i = 0; i < lib.length; ++i) {
				$("#list").append("<li id=\"" + i + "\">" + lib[i].name + "</li>");
			}
			$("li").click(function(e) {
				download(lib[e.target.id]);
				read(lib[e.target.id]);
			});
		}
	});
}