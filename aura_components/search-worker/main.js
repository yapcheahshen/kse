define(['backbone'], function(Backbone) {
  return {
    type: 'Backbone.nested',
    commands:{
      "query.change":"querychange",
      "setrange":"setrange",
      "more":"dosearch",
    },
    querychange:function(query,db) {
      this.model.set({"rangestart":0,"rangeend":-1});
      this.model.set("query",query);
      if (db) this.db=db;
      this.dosearch();
    },
    setrange:function(rangestart,rangeend) {
      this.model.set({"rangestart":rangestart,"rangeend":rangeend});
      this.sandbox.emit("gotoline",rangestart,rangeend);
      query=this.model.get("query");
      if (query) this.dosearch(0);
    },
    dosearch:function(start) {
      var M=this.model.get.bind(this.model);
      var closesttag=[M("pagebreak"),'readunit[id]','p[n]'];
      var output=["text","sourceinfo"];

      var opts={query:M("query"),output:output,rank:M("rank")||"vsm",
          rangestart:M("rangestart")||0,rangeend:M("rangeend")||-1, 
          closesttag:closesttag,
          start:start||0, max:20, db:this.db};

      this.$yase("search",opts).done(function(data) {
        this.sendParent('result.change',data);
      });
    },
    model:new Backbone.Model(),
    initialize: function() {

    }
  };
});
