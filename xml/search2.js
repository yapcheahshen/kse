console.log(require('yase').build({
	input:'search2.lst',
	output:'../search2.ydb',
	validatexml:true,
	author:'yapcheahshen@gmail.com',
	schema:function() {
		this.toctag(["book"])
		     .emptytag("pb")
		     	.attr("pb","n",{"saveval":true,"depth":2})
	}
}));

