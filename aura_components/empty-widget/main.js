define(['underscore','backbone','text!./template.tmpl'], 
  function(_,Backbone,template) {
  return {
    type: 'Backbone.nested',
    events: {

    },
    commands:{
  
    }, 

    render:function() {
      this.html(_.template(template));
      this.addChildren();
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.initNested();
      this.render();
    }
  };
});
