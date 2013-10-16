define(['backbone'], function(Backbone) {
  return {
    type: 'Backbone',
    totalslot:function(tofind) {
      var opts={db:this.db,tofind:tofind,countonly:true};
      var yase=this.sandbox.yase;
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        that.sandbox.emit('totalslot'+this.group,data.count,data.hitcount);
      });
    },
    newsearch:function(tofind) {
      this.model.set({"rangestart":0,"rangeend":-1});
      this.totalslot(tofind);
      this.dosearch(tofind);
    },
    setrange:function(rangestart,rangeend) {
      this.model.set({"rangestart":rangestart,"rangeend":rangeend});
      this.sandbox.emit("gotoline",rangestart,rangeend);
      tofind=this.model.get("tofind");
      if (tofind) {
        this.totalslot(tofind);
        this.dosearch(tofind,0);        
      }
    },
    dosearch:function(tofind,start) {
      if (start>this.model.get("totalslot"))return;
      var rangestart=this.model.get("rangestart")||0;
      var rangeend=this.model.get("rangeend")||-1;
      var pagebreak=this.model.get("pagebreak");
      var opts={showtext:true,highlight:true,sourceinfo:true,
          rangestart:rangestart,rangeend:rangeend, closesttag:pagebreak,
          start:start||0, maxcount:20, db:this.db};
      var yase=this.sandbox.yase;
      opts.tofind=tofind;
      if (typeof tofind=='undefined') opts.tofind=this.model.get("tofind");
      this.model.set({tofind:opts.tofind});
      if (!opts.tofind) return;
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        if (opts.start==0) that.sandbox.emit('newresult'+this.group,data);
        else that.sandbox.emit('moreresult'+this.group,data);
      });
    },
    model:new Backbone.Model(),
    init:function(opts) {
      this.model.set("pagebreak",opts.pagebreak);
      this.db=opts.db;
      this.newsearch(opts.tofind);
    },
    initialize: function() {
      this.db=this.options.db;
      this.groupid=this.$el.data('groupid');
      this.group="";
      if (this.groupid) this.group='.'+this.groupid;
      this.sandbox.on("more"+this.group,this.dosearch,this);
      this.sandbox.on("newsearch"+this.group,this.newsearch,this) ;
      this.sandbox.on("setrange"+this.group,this.setrange,this);
      this.sandbox.once("init."+this.$el.data('viewid'),this.init,this);
    }
  };
});
