define(['backbone','text!../config.json'], function(Backbone,config) {
  return {
    type: 'Backbone',
    totalcount:function(tofind) {
      var opts={tofind:tofind};
      var yase=this.sandbox.yase;
      opts.grouped=true;
      opts.db=this.db;
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        var total=Object.keys(data).length;
        that.sandbox.emit('totalcount',total);
        that.model.set("totalcount",total);
      });
    },
    dosearch:function(tofind,start) {
      if (start>this.model.get("totalcount"))return;
      var opts={};
      var yase=this.sandbox.yase;
      if (!opts.db) opts.db=this.db;
      opts.showtext=true;
      opts.highlight=true;
      opts.sourceinfo=true;
      opts.start=start||0;
      opts.maxcount=20;
      opts.tofind=tofind||this.model.get("tofind");
      this.model.set({tofind:opts.tofind});
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        if (opts.start==0) that.sandbox.emit('newresult',data);
        else that.sandbox.emit('moreresult',data);
      });
      console.log('search',opts.start)
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.db=JSON.parse(config).db; 
      if (!this.db) {
        bootbox.alert("please set ydb in config.json")
      }
      this.sandbox.on("more",this.dosearch,this);
      this.sandbox.on("tofind.change",this.dosearch,this) ;
      this.sandbox.on("tofind.change",this.totalcount,this) ;
    }
  };
});
