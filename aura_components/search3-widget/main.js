define(['backbone','text!../config.json'], function(Backbone,config) {
  return {
    type: 'Backbone',
    totalcount:function(tofind) {
      var opts={tofind:tofind};
      var yase=this.sandbox.yase;
      opts.grouped=true;
      opts.db=this.db;
      opts.countonly=true;
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        that.sandbox.emit('totalcount',data.count,data.hitcount);
      });
    },
    newsearch:function(tofind) {
      this.model.set({"rangestart":0,"rangeend":-1});
      this.totalcount(tofind);
      this.dosearch(tofind);
    },
    setrange:function(rangestart,rangeend) {
      tofind=this.model.get("tofind");
      this.model.set({"rangestart":rangestart,"rangeend":rangeend});
      this.totalcount(tofind);
      this.dosearch(tofind,0);
    },
    dosearch:function(tofind,start) {
      if (start>this.model.get("totalcount"))return;
      var rangestart=this.model.get("rangestart")||0;
      var rangeend=this.model.get("rangeend")||-1;
      var opts={showtext:true,highlight:true,sourceinfo:true,
          rangestart:rangestart,rangeend:rangeend,
          start:start||0, maxcount:20, db:this.db};
      var yase=this.sandbox.yase;
      opts.tofind=tofind||this.model.get("tofind");
      this.model.set({tofind:opts.tofind});
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        if (opts.start==0) that.sandbox.emit('newresult',data);
        else that.sandbox.emit('moreresult',data);
      });
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.db=JSON.parse(config).db; 
      if (!this.db) {
        bootbox.alert("please set ydb in config.json")
      }
      this.sandbox.on("more",this.dosearch,this);
      this.sandbox.on("tofind.change",this.newsearch,this) ;
      this.sandbox.on("setrange",this.setrange,this)
    }
  };
});
