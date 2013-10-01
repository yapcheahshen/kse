define(['underscore','text!./template.tmpl','text!../config.json'], 
  function(_,template,config) {
  return {
    type: 'Backbone',

    render:function() {
      this.html(_.template(template,{ inittabs:JSON.stringify(this.config.tabui) }) );

//      this.$el.find("#tabtexts").trigger('view');
    },
    initialize: function() {
      this.config=JSON.parse(config);
     	this.render();
    }
  };
});
