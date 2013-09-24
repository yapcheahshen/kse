define(['backbone','text!../config.json'], function(Backbone,config) {
  return {
    type: 'Backbone',
    totalslot:function(tofind) {
      var opts={db:this.db,tofind:tofind,countonly:true};
      var yase=this.sandbox.yase;
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        that.sandbox.emit('totalslot',data.count,data.hitcount);
      });
    },
    newsearch:function(tofind) {
      this.model.set({"rangestart":0,"rangeend":-1});
      this.totalslot(tofind);
      this.dosearch(tofind);
    },
    setrange:function(rangestart,rangeend) {
      this.model.set({"rangestart":rangestart,"rangeend":rangeend});
      tofind=this.model.get("tofind");
      if (!tofind) {
        this.sandbox.emit("gotoline",rangestart);
      } else {
        this.totalslot(tofind);
        this.dosearch(tofind,0);        
      }
    },
    dosearch:function(tofind,start) {
      if (start>this.model.get("totalslot"))return;
      var rangestart=this.model.get("rangestart")||0;
      var rangeend=this.model.get("rangeend")||-1;
      var opts={showtext:true,highlight:true,sourceinfo:true,
          rangestart:rangestart,rangeend:rangeend, closesttag:"pb[n]",
          start:start||0, maxcount:20, db:this.db};
      var yase=this.sandbox.yase;
      opts.tofind=tofind
      if (typeof opts.tofind=='undefined') opts.tofindthis.model.get("tofind");
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
