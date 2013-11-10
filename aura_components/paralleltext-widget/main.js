/*
  TODO
  check dictionary
  a global rangy timer will check for selection
*/
define(['underscore','backbone','text!./text.tmpl'], 
  function(_,Backbone,template) {
  return {
    type: 'Backbone',
    events:{
          "mousemove p[n]":"paragraphhover",
          "click #btnsync":"syncparallel"
    },
    syncparallel:function(e) {
      console.log('sync')
    },
    paragraphhover:function(e) {
      $e=$(e.target);
      while ($e.length && !$e.is('p')) {
        $e=$e.parent();
      }
      var top=$e.offset().top;
      var left=$e.offset().left;
      var $listmenu=this.$el.find("#parallelmenu");
      $listmenu.offset({top:top,left:left})
      //var slot=$e.find("[data-slot]").data("slot");
      //$listmenu.data("slot",slot);
    },
    loadtext:function(id) {
      var seq=parseInt(id.substring(id.lastIndexOf('-')+1),10);
      console.log('loadtext',seq);
      var m=this.model.attributes;
      m.db=m.cols[seq].db;
      m.start=m.cols[seq].start;
      m.paralleltext=this.viewid;
      this.sandbox.emit('init.'+id, m);
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
    syncpara:function(opts) {
      for (var i in this.coltexts.models) {
        var id=this.coltexts.models[i].get('id');
        if (id!=opts.from) {
          this.sandbox.emit("scrollto."+id, opts.scrollto, opts.offset);
        }
      }
    },
    finalize:function() {
      this.sandbox.off("resize",this.resize);
      this.sandbox.off("init."+this.viewid,this.init);
    },
    initialize: function() {
      this.model=new Backbone.Model();
      this.controllerheight=20;
      //this.textwidget=this.config.defaulttextwidget;
      this.viewid=this.options.id;
      this.sandbox.once("init."+this.viewid,this.init,this);
      this.sandbox.on("resize",this.resize,this);
      this.sandbox.emit('initialized.'+this.viewid);
      this.sandbox.on("syncpara."+this.viewid,this.syncpara,this);
    }
  };
});
