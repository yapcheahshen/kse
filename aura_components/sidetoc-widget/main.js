define(['underscore','backbone','text!./sidetoc.tmpl','text!./sidetocitem.tmpl','text!../config.json'], 
  function(_,Backbone,template,itemtemplate,config) {
  return {
    type: 'Backbone',
    events: {
      "click .list-group-item":"itemclick"
    },
    itemclick:function(e) {
      var item=$(e.target);
      var toc=this.model.get("toc");
      var n=parseInt(item.attr('data-n'));
      var T=toc[n], depth=T.depth;
      var rangestart=T.slot, rangeend=-1;
      for (var i=n+1;i<toc.length;i++) {
        if (toc[i].depth<=depth) {
          rangeend=toc[i].slot;
          break;
        }
      }
      this.sandbox.emit('setrange',rangestart,rangeend);
    },
    buildtoc:function(tofind) {
      var that=this;
      var opts={db:this.db, tofind:tofind, toc:'logical', hidenohit:true}
      this.sandbox.yase.buildToc(opts,function(err,data){
        that.model.set("toc",data);
        that.render();
      })
    },
    render:function() {
      var toc=this.model.get("toc");
      var res="";
      this.html(template);
      for (var i in toc) {
        toc[i].n=i;
        res+=_.template(itemtemplate,toc[i])  ;
      }
      this.$el.find(".list-group").html(res);
      this.$el.css("height", (window.innerHeight - this.$el.offset().top -10) +"px");
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.db=JSON.parse(config).db; 
      this.sandbox.on("tofind.change",this.buildtoc,this);

      //this.model.on("change:toc",this.render,this);
    }
  };
});
