define(['backbone'], function(Backbone) {
  return {
    type: 'Backbone.nested',
    commands:{
      "query.change":"querychange",
      "setrange":"setrange",
      "moreresult":"dosearch"
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
      var rangestart=this.model.get("rangestart")||0;
      var rangeend=this.model.get("rangeend")||-1;
      var pagebreak=this.model.get("pagebreak");
      var closesttag=[pagebreak,'readunit[id]','p[n]'];
      var distance=this.model.get("")

      var opts={output:["text"],sourceinfo:true,
          rangestart:rangestart,rangeend:rangeend, closesttag:closesttag,
          query:this.model.get("query"),distance:this.model.get("distance"),
          start:start||0, max:20, db:this.db};

      this.$yase("search",opts).done(function(data) {
        this.sendParent('result.change',data);
      });
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.initNested();
    }
  };
});
