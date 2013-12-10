define(['underscore','backbone','text!./text.tmpl'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone.nested',
    newreader:function(opts) {
      //texts,name,scrollto
      var opts2={widget:opts.reader||"multitext@kse",
      name:opts.name,focus:true,
      extra:{readtext:opts.textcomponent||"text@kse",
        query:opts.query,
        dbselector:opts.dbselector||"select-db@kse",
    	scrollto:opts.scrollto,db:opts.db,start:opts.start,paramenu:opts.paramenu}};
      this.sandbox.emit("newtab",opts2);
    },
    initialize: function() {
      this.sandbox.on('newreader',this.newreader,this);
    }
  };
});