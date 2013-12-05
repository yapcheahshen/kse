/*
 kurūsu kammāsadhammaṃ 
*/
define(['underscore','backbone',
  'text!./template.tmpl','text!./texttemplate.tmpl','text!./menutemplate.tmpl'], 
  function(_,Backbone,template,texttemplate,menutemplate) {
  return {
    type: 'Backbone.nested',
    events: {
      "mouseenter p[n]":"enterpara",
      "mouseleave p[n]":"leavepara",
    },
    commands:{
       "tabinit":"tabinit", 
       "settext":"settext"
    }, 

    render:function() {
      var o={height:this.getheight()}
      this.html(_.template(template,o));
    },
    blink:function($e) {
        $e.css('opacity',0.1);
        $e.animate({
            opacity: 1,
          }, 1000 );
    },

    fetchbytag:function() {
      var that=this;
      this.sandbox.yase.getTextByTag({db:this.db, 
        selector:this.start,query:this.query, maxslot:5000},
        function(err,data){
          that.$(".bodytext").html(_.template(texttemplate,data));
          that.insertParagraphMenu();
          if (!that.scrollto) return;

          setTimeout(function(){
            var offset=that.$el.find(that.scrollto).offset() || {top:0};
            that.$el.animate({
                scrollTop: offset.top-100
            },'slow',function(){
               that.blink(that.$el.find(that.scrollto));  
            });            
          },500);
      })      
    },
    settext:function(opts) {
      if (!opts) return;
      this.$(".bodytext").html("loading text..." );
      this.start=opts.start;
      this.query=opts.query;
      this.scrollto=opts.scrollto;
      this.db=opts.db;
      this.fetchbytag();
    },   
    tabinit:function(opts) {
      this.model.set(opts);
      this.settext(opts)
    },
    getheight:function() {
      var p=$(".mainview");
      return p.height()-this.$el.offset().top-20;      
    },
    insertParagraphMenu:function() {
      var paragraphs=this.$("p[n]");
      paragraphs.append("<span id='paramenu'></span>");
    },
    enterpara:function(e) {
      $e=$(e.target);
      while ($e.length && $e[0].tagName!='P') {
        $e=$e.parent();
      }
      var o={}; //find other db with same p[n]
      $e.find("#paramenu").html(_.template(menutemplate,o));
      var pn=$e.find("p[n]").attr("n");

    },   
    leavepara:function(e)  {
      $e=$(e.target);
      while ($e.length && $e[0].tagName!='P') {
        $e=$e.parent();
      }
      $e.find("#paramenu").html("");
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.render();

    }
  };
});
