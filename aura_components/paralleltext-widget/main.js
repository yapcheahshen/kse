define(['underscore','backbone','text!./text.tmpl'], 
  function(_,Backbone,template) {
  return {
    type: 'Backbone',
    loadtext:function(id) {
      var seq=parseInt(id.substring(id.lastIndexOf('-')+1),10);
      console.log('loadtext',seq);
      var m=this.model.attributes;
      m.db=m.cols[seq].db;
      m.start=m.cols[seq].start;
      this.sandbox.emit('load.'+id, m);
    },
    render:function() {
      var coltexts=this.coltexts.toJSON();
      var h=this.getheight();
      opts={T:coltexts,widget:this.model.get('textwidget'),height:h};
      for (var i in coltexts) {
        this.sandbox.once('initialized.'+coltexts[i].id,this.loadtext,this)
      }

      this.html(_.template(template,opts) ); 
    },
    getheight:function() {
      var p=$(".mainview");
      return p.height()-this.$el.offset().top-this.controllerheight;      
    },
    resize:function() {
      var texts=this.$el.find("div.text");
      var h=this.getheight();
      for (var i=0;i<texts.length;i++) {
        $(texts[i]).css('height',h);
      }
      console.log('resize');
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
      var count=0;
      for (var i in coltexts) {
        coltexts[i].id=this.viewid+'-text-'+count;
        count++;
      }
      this.coltexts.reset(coltexts);
      this.render();
    },
    coltexts:new Backbone.Collection(),
    init:function(opts) {
      this.model.set(opts);
      this.settext(opts.cols);
    },
    finalize:function() {
      this.sandbox.off("resize",this.resize);
      var viewid=this.$el.data('viewid');
      this.sandbox.off("init."+viewid,this.init);
    },
    initialize: function() {
      this.model=new Backbone.Model();
      this.controllerheight=20;
      //this.textwidget=this.config.defaulttextwidget;
      this.viewid=this.$el.data('viewid');
      this.sandbox.once("init."+this.viewid,this.init,this);
      this.sandbox.on("resize",this.resize,this);
      this.sandbox.emit('initialized.'+this.viewid);
    }
  };
});
