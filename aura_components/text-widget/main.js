define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {

    },
    render:function() {
      var that=this;
      var yase=this.sandbox.yase;
      this.html(_.template(template,{text:"loading text..."}) );
      yase.getTextByTag({db:this.db, selector:this.start, maxslot:5000},
        function(err,data){
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
