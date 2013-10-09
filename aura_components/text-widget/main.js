define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {

    },
    render:function() {
     // this.resize();
    },
    render:function() {
      var that=this;
      var yase=this.sandbox.yase;

      yase.getTextByTag({db:this.db, selector:this.start},function(err,data){
          that.html(_.template(template,data) );
      })
    },

    model:new Backbone.Model(),
    initialize: function() {
      this.db=this.options.db;
      this.start=this.options.start;
      this.render();
    }
  };
});
