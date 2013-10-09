define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {

    },

    render:function() {
      var coltexts=this.coltexts.toJSON();
      var p=this.$el.parent();
      while (!p.height()) {
        p=p.parent();
      }
      var controllerheight=20;
      var h=p.height()-this.$el.offset().top-controllerheight;
      var opts={T:coltexts,widget:this.textwidget,height:h};
      this.html(_.template(template,opts) );
      //set the height;
    },
    autolayout:function(coltexts) {
      var distributes={1:12,2:6,3:4,4:3};
      var col=distributes[coltexts.length];
      if (!col) col=1;

      for (var i in coltexts) coltexts[i].col=col;
    },
    settext:function(coltexts) {
      if (coltexts.length==0) throw 'no text to show';
      if (!coltexts[0].col) this.autolayout(coltexts);
      this.coltexts.reset(coltexts);
      this.render();
    },
    coltexts:new Backbone.Collection(),
    initialize: function() {
      this.config=JSON.parse(config);
      this.db=this.config.db;
      this.textwidget=this.config.defaulttextwidget;
      this.sandbox.once("settext."+this.$el.data('viewid'),this.settext,this);

    }
  };
});
