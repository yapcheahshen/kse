/*
  TODO
  check dictionary
  a global rangy timer will check for selection
*/
define(['underscore','backbone','text!./text.tmpl'], 
  function(_,Backbone,template) {
  return {
    type: 'Backbone.nested',
    events:{
          "mousemove p[n]":"paragraphhover"
    },
    commands:{
      "syncpara":"syncpara",
      "tabinit":"tabinit"
    },
    syncpara:function(opts) {
      this.sendChildren("scrollpara", opts.scrollto, opts.offset,opts.from);
    },    paragraphhover:function(e) {
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
      console.log('loadtext',seq);
      this.sandbox.emit('init.'+id, m);
    },
    render:function() {
      var coltexts=this.coltexts.toJSON();
      var h=this.getheight();
      opts={T:coltexts,component:this.model.get('textwidget'),height:h};
      this.html(_.template(template,opts) ); 
    },
    onReady:function() {
    	var coltexts=this.coltexts.toJSON();
    	var extras=[];
        for (var i in coltexts) {
          var m=this.model.attributes;
          var r={};
          r.db=m.cols[i].db;
          r.start=m.cols[i].start;
          r.scrollto=m.scrollto;
          r.query=m.query;
          extras.push(r)
        }
    	this.sendChildrenByArray("settext",extras);
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
    setupcolumn:function(coltexts) {
      if (coltexts.length==0) throw 'no text to show';
      if (!coltexts[0].col) this.autolayout(coltexts);
      var count=0;
      for (var i in coltexts) {
        coltexts[i].id=this.cid+'-text-'+count;
        count++;
      }
      this.coltexts.reset(coltexts);
      this.render();
    },
    coltexts:new Backbone.Collection(),
    tabinit:function(opts) {
      this.model.set(opts);
      this.setupcolumn(opts.cols);
    },

    initialize: function() {
      this.model=new Backbone.Model();
      this.controllerheight=20;
    }
  };
});
