define(['underscore','text!./template.tmpl','backbone'], 
 function(_,template,Backbone) {
  return {
   type:"Backbone",
    events: {
      "click input[name='selectdb']":"selectdb",
    },
    selectdb:function(e){
      var db=$(e.target).data('db');
      this.sandbox.emit("selectdb",db);
    },
    getpath:function(path) {
      var that=this;
      this.sandbox.yase.getRaw(path, function(err,data) {
        that.model.set("dbs",data);
        that.sandbox.emit('enumdb',data);
      });
    }, 
    setdbhit:function(db,hit) {
      hit=hit||0;
      var dbs=this.model.get("dbs");
      dbs[db].hit=hit;
      var hitspan=this.$el.find("input[data-db='"+db+"']").next();
      hitspan.removeClass();
      hitspan.addClass('label');
      hitspan.html(hit);
      if (hit) hitspan.addClass('label-success');
      else hitspan.addClass('label-danger');
    },
    render:function() {
      var dbs=this.model.get('dbs')
      for (var i in dbs) {
        dbs[i].hit=0;
        dbs[i].extraclass="label-danger";
      }
      this.html(_.template(template,{dbs:dbs}) );
      this.$el.find("input:first").click();
    },
    initialize: function() {
      this.model=new Backbone.Model();
      this.getpath([]);
      this.model.on("change:dbs",this.render,this);
      this.sandbox.on('setdbhit',this.setdbhit,this);
    }
  }
});
