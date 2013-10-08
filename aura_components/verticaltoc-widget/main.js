define(['underscore','backbone',
  'text!./template.tmpl','text!./dropdown.tmpl','text!./listgroup.tmpl','text!../config.json'], 
  function(_,Backbone,template,dropdowntemplate,listgrouptemplate,config) {
  return {
    type: 'Backbone',
    events: {
      "click .list-group-item":"itemclick",
    },

    itemclick:function(e) {
      var item=$(e.target);
      if (e.target.tagName!='A') item=item.parent();
      var toc=this.model.get("toc");
      var slot=parseInt(item.data('slot'));
      var toctree=this.sandbox.flattoc.goslot(slot);
      item.siblings().removeClass('active');
      item.addClass('active');

      this.model.set("updatedepth",item.data('depth'));
      this.model.set("toctree",this.filltoc(toc,toctree));
      this.sandbox.emit("setslot",slot);
      e.preventDefault();
    },
    filltoc:function(toc,toctree) {
        for (var i in toctree) {
          if (isNaN(parseInt(i))) continue;
          i=parseInt(i);
          for (var j=0;j<toctree[i].length;j++) {
            var seq=toctree[i][j];
            var node=toc[seq];//JSON.parse(JSON.stringify(toc[seq]));
            node.active= ( seq==toctree.lineage[i]) ;
            node.haschild= (seq<toc.length-1 && toc[seq+1].depth==toc[seq].depth+1) 
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
    findactive:function(toctree) {
      for (var i=0;i<toctree.length;i++) {
        if (toctree[i].active) return i;
      }
      return -1;
    },
    render:function(upto) {
      /*TODO: render only children*/
      var toc=this.model.get("toc");
      var toctree=this.model.get("toctree");
      var res="";
      var items=[];
      var updatedepth=this.model.get("updatedepth")||-1;
      if (updatedepth==-1) this.html(template);

      
      $toc=this.$el.find("#toctree");
      $container=this.$el;

      $needupdate=$toc.find("div[data-depth]").filter(function(){return $(this).attr('data-depth')>updatedepth});
      $needupdate.remove();

      for (var i in toctree) {
        if (isNaN(parseInt(i))) continue;
        i=parseInt(i);
        if (i<=updatedepth) continue;

        var obj={depth:i,tree:toctree[i],width:200,height:200};

        obj.active=this.findactive(toctree[i]);
        console.log(obj.active)
        var items=_.template( this.itemtemplate , obj);
        $toc.append(items);
      }
      
      //hide the vertical scrollbar
      var divs=$toc.find(".listgroupdiv");
      for (var i=0;i<divs.length;i++){
        var $div=$(divs[i]);
        var w=$div.parent().width() || 150;
        $div.width(w+17);
        $div.parent().width(w);
      };
    },
    model:new Backbone.Model(),
    initialize: function() {
      var itemstyle=this.options.itemStyle || "listgroup";
      this.itemtemplate=eval(itemstyle+"template");
      this.config=JSON.parse(config);
      this.db=this.config.db; 
      this.sandbox.on("tofind.change",this.buildtoc,this);
      this.model.on("change:toctree",this.render,this);
    }
  };
});
