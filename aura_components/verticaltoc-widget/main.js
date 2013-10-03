define(['underscore','backbone',
  'text!./template.tmpl','text!./dropdown.tmpl','text!./listgroup.tmpl','text!../config.json'], 
  function(_,Backbone,template,dropowntemplate,listgrouptemplate,config) {
  return {
    type: 'Backbone',
    events: {
      "click .list-group-item":"itemclick",
    },

    itemclick:function(e) {
      var item=$(e.target);
      var toc=this.model.get("toc");
      var slot=parseInt(item.attr('data-slot'));
      var toctree=this.sandbox.flattoc.goslot(slot);
      this.model.set("toctree",this.filltoc(toc,toctree));
    },
    filltoc:function(toc,toctree) {
        for (var i in toctree) {
          if (isNaN(parseInt(i))) continue;
          i=parseInt(i);
          for (var j=0;j<toctree[i].length;j++) {
            var seq=toctree[i][j];
            var node=JSON.parse(JSON.stringify(toc[seq]));
            if ( seq==toctree.lineage[i]) {
              node.active=true;
            } 
            if (seq<toc.length && toc[seq+1].depth==toc[seq].depth+1) {
              node.haschild=true;
            }
            toctree[i][j]=node;
          }
        }
        return toctree;
    },
    buildtoc:function(tofind) {
      var that=this;
      var opts={db:this.db, tofind:tofind, toc:this.config.toc, hidenohit:false}
      this.sandbox.yase.buildToc(opts,function(err,toc){
        that.model.set("toc",toc);
        that.sandbox.flattoc.set(toc);
        var toctree=that.sandbox.flattoc.go(0);
        that.model.set({"toc":toc, "toctree":that.filltoc(toc,toctree)});
        that.render(0);
      })
    },
    render:function(upto) {
      var toc=this.model.get("toc");
      var toctree=this.model.get("toctree");
      var res="";
      var items=[];
      this.html(template);
      var itemtemplate=listgrouptemplate;
      $toc=this.$el.find("#toctree");
      for (var i in toctree) {
        if (isNaN(parseInt(i))) continue;
        var obj={tree:toctree[i],width:200,height:150};
        var items=_.template( itemtemplate , obj);
        $toc.append(items);
      }
      

    },
    model:new Backbone.Model(),
    initialize: function() {
      this.config=JSON.parse(config);
      this.db=this.config.db; 
      this.sandbox.on("tofind.change",this.buildtoc,this);
      this.model.on("change:toctree",this.render,this);
    }
  };
});
