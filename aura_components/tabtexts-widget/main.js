define(['underscore','text!./texts.tmpl'], 
  function(_,template,config) {
  return {
    type: 'Backbone',
    render:function() {
      this.html(template);
    },
    initialize: function() {
     	this.render();
      var that=this;
    }
  };
});
