define(['backbone'], function(Backbone) {
  return {
    type: 'Backbone',
    totalslot:function(tofind) {
      var opts={db:this.db,tofind:tofind,countonly:true};
      var yase=this.sandbox.yase;
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        that.sandbox.emit('totalslot',data.count,data.hitcount);
        that.model.set({"totalslot":data.count,"totalhit":data.hitcount});
      });
    },
    dosearch:function(tofind,start) {
      if (start>this.model.get("totalslot"))return;
      var yase=this.sandbox.yase;
      var opts={
        db:this.db,showtext:true,highlight:true,sourceinfo:true,
        start:start||0,maxcount:20,closesttag:"pb[n]",
        tofind:tofind||this.model.get("tofind")
      };
      this.model.set({tofind:opts.tofind});
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        if (opts.start==0) that.sandbox.emit('newresult',data);
        else that.sandbox.emit('moreresult',data);
      });
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.db=this.options.db;
      this.sandbox.on("more",this.dosearch,this);
      this.sandbox.on("tofind.change",this.dosearch,this) ;
      this.sandbox.on("tofind.change",this.totalslot,this) ;
    }
  };
});
