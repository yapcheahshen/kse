define(['underscore','backbone','text!./template.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {
      "click #website":"gowebsite"
    },
    gowebsite:function() {
      var gui=require('nw.gui');
      if (gui) gui.Shell.openExternal(this.website);
      else window.open(this.website,'_blank');
    },
    render:function() {
      this.html(_.template(template,{}));
    },
    initialize: function() {
      this.config=JSON.parse(config);
      this.render();
      this.website=this.config.website;
    }
  };
});
