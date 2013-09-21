define(['underscore','backbone','text!./sidetoc.tmpl','text!./sidetocitem.tmpl','text!../config.json'], 
  function(_,Backbone,template,itemtemplate,config) {
  return {
    type: 'Backbone',
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
