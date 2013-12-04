define(['underscore','text!./template.tmpl'], 
  function(_,template) {
  return {
    type: 'Backbone.nested',
    newtab:function(e) {
      var opts={tabsid:this.readerid,name:'abc',widget:'readtext@kse'};
      this.sandbox.emit("newtab",opts);
    },
    render:function() {
      var opts={
        tabswidget:this.options.tabsWidget||"tabtexts@kse",
        textwidget:this.options.textWidget||"readtext@kse"
      }
      this.readerid=opts.readerid='reader-'+_.uniqueId();
      this.html(_.template(template,opts) );
    },
    initialize: function() {
      this.render();
    }
  };
});