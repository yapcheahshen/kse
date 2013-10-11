define(['underscore','text!./template.tmpl'], 
  function(_,template) {
  return {
    type: 'Backbone',
    newtab:function(e) {
      var opts={tabsid:this.readerid,name:'abc',widget:'text-widget@kse'};
      this.sandbox.emit("newtab",opts);
    },
    render:function() {
      var opts={
        tabswidget:this.options.tabsWidget||"tabtexts-widget@kse",
        textwidget:this.options.textWidget||"text-widget@kse"
      }
      this.readerid=opts.readerid='reader-'+_.uniqueId();
      this.html(_.template(template,opts) );
    },
    initialize: function() {
     	this.render();
      var that=this;
    }
  };
});