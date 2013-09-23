console.log(require('yase').build({
	input:'search3.lst',
	output:'../search3.ydb',
	author:'yapcheahshen@gmail.com',
	toc:{
		"physical":["book","pb[n]"],
		"logical":["sutra","chapter","section"]
	},
	schema:function() {
		this.toctag(["sutra","book"])
		    .toctag("chapter")
		    .toctag("section")
		    .emptytag("pb")
		     	.attr("pb","n",{"saveval":true,"prefix":"book"})
	},
}));

