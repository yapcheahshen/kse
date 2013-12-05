define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone.nested',
    newreader:function(opts) {
      //texts,name,scrollto
      var opts2={widget:"multitext@kse",
      name:opts.name,focus:true,
      extra:{readtext:this.config.defaulttextwidget,
        query:opts.query,
        dbselector:this.config.dbselector||"select-db@kse",
        scrollto:opts.scrollto,db:opts.db,start:opts.start}};
      this.sandbox.emit("newtab",opts2);
    },
    initialize: function() {
      this.config=JSON.parse(config);
      this.sandbox.on('newreader',this.newreader,this);
    }
  };
});