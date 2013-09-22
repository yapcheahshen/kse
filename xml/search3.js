console.log(require('yase').build({
	dbid:'search3',
	input:'search3.xml',
	output:'../search3.ydb',
	slotshift:7,
	author:'yapcheahshen@gmail.com',
	toc:{
		"physical":["book","pb[n]"],
		"logical":["sutra","chapter","section"]
	},
	schema:function() {
		this.toctag(["sutra","book"])
		     .toctag("chapter")
		        .attr("chapter","n",{"depth":1})
		     .toctag("section")
		     .emptytag("pb")
		     	.attr("pb","n",{"saveval":true,"prefix":"book","depth":2,"unique":true})
	},
}));

