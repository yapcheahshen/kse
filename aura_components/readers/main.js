define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone.nested',
    newreader:function(opts) {
      //texts,name,scrollto
      var opts2={widget:"paralleltext@kse",
      name:opts.name,focus:true,
      extra:{textwidget:this.config.defaulttextwidget,
        query:opts.query,
        scrollto:opts.scrollto,cols:opts.texts}};
      this.sandbox.emit("newtab",opts2);
    },
    initialize: function() {
      this.config=JSON.parse(config);
      this.sandbox.on('newreader',this.newreader,this);
    }
  };
});