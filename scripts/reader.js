function clearBody() {
	$("body").empty();
}
function getnext(arr, curr) {
	i = curr.ch;
	j = curr.pg;
	if(j == arr[i] - 1) {
		if(arr[+i+1])
			return { "ch" : i+1, "pg" : 0};
		return curr;
	}
	return { "ch" : i, "pg" : j+1 };
}
function getprev(arr, curr) {
	i = curr.ch;
	j = curr.pg;
	if(j == 0) {
		if(i > 0)
			return { "ch" : i-1, "pg" : arr[i-1]};
		return curr;
	}
	return { "ch" : i, "pg" : j-1 };
}
function view(manga, curr) {
	document.title = manga.name + " | " + (curr.ch+1) + " " + (curr.pg+1);
	$("#page").attr("src", "library/" + manga.path + "/chapter_" + curr.ch + "/" + curr.pg + ".jpg");
	scroll(0, 0);
}
function read(manga) {
	fs.readFile("library/" + manga.path + "/data.json", function(err, data) {
		if(err) {
			setTimeout(function() {
				read(manga);
			}, 3000);
			return;
		}
		var info = JSON.parse(data);
		var curr = new Object();
		curr.ch = 0;
		curr.pg = 0;
		clearBody();
		$("body").append('<img id="page"></img>');
		$("body").keydown(function(e) {
			if(e.keyCode == 37) {
				curr = getprev(info.downloaded, curr);
				view(manga, curr);
			}
			else if(e.keyCode == 39) {
				curr = getnext(info.downloaded, curr);
				view(manga, curr);
			}
			else if(e.keyCode == 82) {
				read(manga);
			}
		});
		view(manga, curr);
	});

}