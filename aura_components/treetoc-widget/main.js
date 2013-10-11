define(['underscore','backbone','text!./treetoc.tmpl','text!./treetocitem.tmpl','text!../config.json'], 
  function(_,Backbone,template,itemtemplate,config) {
  return {
    type: 'Backbone',
    events: {
      "click .list-group-item":"itemclick",
    },
    /*
      fork branch ex3 

      1) defer loading
      2) get other TOC and select by dropdown  
         hint:
         this.sandbox.yase.getRaw([this.db,'meta','toc'],function(err,data) {
           //return an object , keys are name of toc
        });
      3) when tofind is empty, click on toc node show the text
    */
    itemclick:function(e) {
      var item=$(e.target);
      var toc=this.model.get("toc");
      var n=parseInt(item.attr('data-n'));
      if (isNaN(n)) item=item.parent();
      n=parseInt(item.attr('data-n'));
      
      var T=toc[n], depth=T.depth;
      var rangestart=T.slot, rangeend=-1;
      for (var i=n+1;i<toc.length;i++) {
        if (toc[i].depth<=depth) {
          rangeend=toc[i].slot;
          break;
        }
      }
      if (T.open) this.closenode(n);
      else this.opennode(n);

      this.sandbox.emit('setrange',rangestart,rangeend);
    },
    buildtoc:function(tofind) {
      var that=this;
      var opts={db:this.db, tofind:tofind, toc:config.toc, hidenohit:true}
      this.sandbox.yase.buildToc(opts,function(err,data){
        that.model.set("toc",data);
        that.render(0);
      })
    },

    opendomnode:function(dom) {
      dom.show().find("#folder").attr('class','arrow-down');
    },
    closedomnode:function(dom) {
      dom.find("#folder").attr('class','arrow-right');
    },  
    closenode:function(n) {
      var toc=this.model.get("toc");
      var tocnode=toc[n];
      tocnode.open=false;
      this.closedomnode(toc[n].dom);
      if (!tocnode.haschild) return;
      var depth=tocnode.depth+1;
      for (var i=n+1;i<toc.length;i++) {
        if (toc[i].depth<depth) break;
        else if (toc[i].depth==depth) toc[i].open=false;
        if (toc[i].dom) toc[i].dom.hide();
      }
    },
    opennode:function(n) {
      var toc=this.model.get("toc");
      var tocnode=toc[n];
      if (!tocnode.haschild) return;
      tocnode.open=true;
      var last=toc[n].dom;
      this.opendomnode(toc[n].dom);
      var depth=tocnode.depth+1;
      for (var i=n+1;i<toc.length;i++) {
        if (toc[i].depth==depth) {
          if (!toc[i].dom) {
            toc[i].dom=$(_.template(itemtemplate,toc[i]));
            last.after(toc[i].dom);
            last=toc[i].dom;
          } else {
            toc[i].dom.show();
          }
          if (!toc[i].haschild) toc[i].open=true;
        } else if (toc[i].depth<depth) break;
        else if (toc[i].open) toc[i].dom.show();
      }
    },
    render:function(upto) {
      var toc=this.model.get("toc");
      var res="";
      this.html(template);
      $list=this.$el.find(".list-group");
      for (var i=0;i<toc.length;i++) {
        toc[i].n=i;
        toc[i].haschild=(i+1<toc.length && toc[i+1].depth>toc[i].depth);
        if (toc[i].depth>upto) continue;
        toc[i].dom=$(_.template(itemtemplate,toc[i]));
        $list.append(toc[i].dom);
        toc[i].open=false;
      }

      this.$el.css("height", (window.innerHeight - this.$el.offset().top -10) +"px");
    },
    model:new Backbone.Model(),
    initialize: function() {
      config=JSON.parse(config);
      this.db=config.db; 
      this.sandbox.on("tofind.change",this.buildtoc,this);
    }
  };
});
