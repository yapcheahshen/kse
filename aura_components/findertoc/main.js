define(['underscore','backbone',
  'text!./template.tmpl','text!./dropdown.tmpl','text!./listgroup.tmpl'], 
  function(_,Backbone,template,dropdowntemplate,listgrouptemplate) {
  return {
    type: 'Backbone.nested',
    events: {
      "click .list-group-item":"itemclick",
    },
    commands:{
      "settoc":"settoc"
    },
    itemclick:function(e) {
      var item=$(e.target);
      if (e.target.tagName!='A') item=item.parent();
      var slot=parseInt(item.data('slot'));
      this.toctree=this.flattoc.goslot(slot);
      var siblings=item.siblings();
      if (this.itemstyle=='dropdown') {
        siblings=item.parent().parent().find("li a");
      }
      siblings.removeClass('active');
      item.addClass('active');

      this.model.set("slot",slot);
      this.model.set("updatedepth",item.data('depth'));

      this.filltoc();
      this.render();
      e.preventDefault();
    },
    filltoc:function() {
        for (var i in this.toctree) {
          if (isNaN(parseInt(i))) continue;
          i=parseInt(i);
          for (var j=0;j<this.toctree[i].length;j++) {
            var seq=this.toctree[i][j];
            var node=this.toc[seq];//JSON.parse(JSON.stringify(toc[seq]));
            node.active= ( seq==this.toctree.lineage[i]) ;
            node.haschild= (seq<this.toc.length-1 && this.toc[seq+1].depth==this.toc[seq].depth+1) 
            this.toctree[i][j]=node;
          }
        }
        return this.toctree;
    },
    buildtoc:function(db,query) {
      var opts={db:db, query:query,
                toc:this.tocsetting, hidenohit:this.hidenohit}
      this.$yase("buildToc",opts).done(function(toc){
        this.flattoc=new this.sandbox.flattoc();
        this.flattoc.set(toc);
        this.toc=toc;
        this.toctree=this.flattoc.go(0);
        this.filltoc();
        this.render();
      })
    },
    findactive:function(toctree) {
      for (var i=0;i<toctree.length;i++) {
        if (toctree[i].active) return i;
      }
      return -1;
    },
    hidescrollbar:function() {
      var divs=$toc.find(".listgroupdiv");
      for (var i=0;i<divs.length;i++){
        var $div=$(divs[i]);
        var w=$div.parent().width() || 150;
        $div.width(w+17);
        $div.parent().width(w);
      };      
    },
    render:function(upto) {
      /*TODO: render only children*/
      var res="", items=[];
      var updatedepth=this.model.get("updatedepth")||-1;
      if (updatedepth==-1) this.html(template);
      console.log('render toc',this.group)
      $toc=this.$el.find("#toctree");
      $needupdate=$toc.find("div[data-depth]").filter(function(){return $(this).attr('data-depth')>updatedepth});
      $needupdate.remove();
      var selectedleafnode=this.model.get('slot');
      var rangestart=selectedleafnode;

      for (var i in this.toctree) {
        if (isNaN(parseInt(i))) continue;
        i=parseInt(i);
        if (i<=updatedepth) continue; //no need to repaint

        //TODO need to read from parent
        var obj={depth:i,tree:this.toctree[i],width:200,height:500};

        obj.active=this.findactive(this.toctree[i]);
        selectedleafnode=obj.tree[obj.active].slot;

        $toc.append(_.template( this.itemtemplate , obj));
      }


      this.model.set('slot',selectedleafnode);
      this.sandbox.emit("dbslotselected",{db:this.db,slot:selectedleafnode});
      this.sandbox.emit('setrange'+this.group,rangestart,-1);
      this.hidescrollbar();
    },
    model:new Backbone.Model(),
    settoc:function(opts) {
      this.tocsetting=opts.toc;
      this.hidenohit=opts.hidenohit;
      this.buildtoc(opts.db,opts.query);
      this.itemstyle=opts.itemstyle||this.options.itemStyle ;

      this.itemstyle=this.itemstyle || "listgroup";
      this.hidenohit=JSON.parse(this.hidenohit || "false");
      this.itemtemplate=eval(this.itemstyle+"template");
    },
    initialize: function() {
    }
  };
});
