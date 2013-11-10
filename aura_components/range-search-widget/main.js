define(['backbone'], function(Backbone) {
  return {
    type: 'Backbone',
    totalslot:function(tofind) {
      var opts={db:this.db,tofind:tofind,countonly:true,
        searchtype:this.model.get("searchtype"),
        distance:this.model.get("distance")};
      var yase=this.sandbox.yase;
      var that=this;
      yase.search(opts,function(err,data) {
        that.sandbox.emit('totalslot'+that.group,data.count,data.hitcount);
      });
    },
    newsearch:function(tofind) {
      this.model.set({"rangestart":0,"rangeend":-1});
      this.totalslot(tofind);
      this.model.set("tofind",tofind);
      this.dosearch();
    },
    setrange:function(rangestart,rangeend) {
      this.model.set({"rangestart":rangestart,"rangeend":rangeend});
      this.sandbox.emit("gotoline",rangestart,rangeend);
      tofind=this.model.get("tofind");
      if (tofind) {
        this.totalslot(tofind);
        this.dosearch(0);
      }
    },
    dosearch:function(start) {
      if (start>this.model.get("totalslot"))return;
      var rangestart=this.model.get("rangestart")||0;
      var rangeend=this.model.get("rangeend")||-1;
      var pagebreak=this.model.get("pagebreak");
      var closesttag=[pagebreak,'readunit[id]','p[n]'];
      var distance=this.model.get("")
      var opts={showtext:true,highlight:true,sourceinfo:true,
          rangestart:rangestart,rangeend:rangeend, closesttag:closesttag,
          tofind:this.model.get("tofind"),distance:this.model.get("distance"),
          start:start||0, maxcount:20, db:this.db, searchtype:this.model.get("searchtype")};
      var yase=this.sandbox.yase;
      if (!opts.tofind) return;
      var that=this;

      yase.search(opts,function(err,data) {
        if (opts.start==0) that.sandbox.emit('newresult'+that.group,data,that.db,opts.tofind,opts.searchtype);
        else that.sandbox.emit('moreresult'+that.group,data);
      });
    },
    model:new Backbone.Model(),
    finalize:function() {
      this.sandbox.off("more"+this.group,this.dosearch);
      this.sandbox.off("newsearch"+this.group,this.newsearch) ;
      this.sandbox.off("setrange"+this.group,this.setrange);
      console.log('range search widget finalized');
    },
    load:function(id,opts) {
      if (id!=this.id) return;
      this.model.set("pagebreak",opts.pagebreak);
      this.db=opts.db;
      this.model.set({"distance":opts.distance, searchtype:opts.searchtype||"phraseSearch"});
      this.newsearch(opts.tofind);
    },
    initialize: function() {
      this.db=this.options.db;
      this.id='rs'+Math.round(Math.random()*10000);
      this.groupid=this.$el.data('groupid');
      this.group="";
      if (this.groupid) this.group='.'+this.groupid;
      this.sandbox.on("more"+this.group,this.dosearch,this);
      this.sandbox.on("newsearch"+this.group,this.newsearch,this) ;
      this.sandbox.on("setrange"+this.group,this.setrange,this);
      this.sandbox.once("init"+this.group,this.load,this);
      this.sandbox.once("finalize"+this.group,this.finalize,this);
      this.sandbox.emit("initialized"+this.group,this.id);
    }
  };
});
