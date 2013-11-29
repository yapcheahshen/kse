define(['underscore','text!./template.tmpl','backbone'], 
 function(_,template,Backbone) {
  return {
   type:"Backbone.nested",
    events: {
      "click input[name='selectdb']":"selectdb",
    },
    commands: {
      "setdbhit":"setdbhit",
      "ready":"ready"
    },
    selectdb:function(e){
      var db=$(e.target).data('db');
      this.sendParent("selectdb",db);
    },
    getpath:function(path) {
      var that=this;
      this.$yase("getRaw",path).done(function(data) {
        this.model.set("dbs",data);
        this.sendParent('enumdb',data);
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
    ready:function() {
      this.getpath([]);
    },
    initialize: function() {
      this.model=new Backbone.Model();
      this.model.on("change:dbs",this.render,this);
      this.initNested();
    }
  }
});
