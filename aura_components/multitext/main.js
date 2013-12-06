/*
 kurūsu kammāsadhammaṃ 
*/
define(['underscore','backbone',
  'text!./template.tmpl','text!./texttemplate.tmpl','text!./menutemplate.tmpl'
  ,'text!./relatedtext.tmpl'], 
  function(_,Backbone,template,texttemplate,menutemplate,relatedtext) {
  return {
    type: 'Backbone.nested',
    events: {
      "mouseenter p[n]":"enterpara",
      "mouseleave p[n]":"leavepara",
      "click .relatedtext":"showrelated"
    },
    commands:{
       "tabinit":"tabinit", 
       "settext":"settext"
    }, 
    showrelated:function(e) {
      $e=$(e.target);
      var db=$e.data('db');
      var selector=$e.data('selector').split(",");
      this.$yase("getTextByTag", {db:db, selector:selector}).done(function(data){
        console.log(data.text)
      })

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
      this.cssselector=opts.scrollto.substring(0,opts.scrollto.indexOf("="));
      this.csstag=this.cssselector.substring(0,this.cssselector.indexOf("["));
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
      var paragraphs=this.$(this.cssselector+']');
      paragraphs.append("<span id='paramenu'></span>");
    },
    enterpara:function(e) {
      $e=$(e.target);
      while ($e.length && $e[0].tagName!=this.csstag.toUpperCase()) {
        $e=$e.parent();
      }
      
      var menu=$e.find("#paramenu");
      var loaded=menu.data('loaded');
      if (!loaded) {
        var o={}; //find other db with same p[n]
        var value=$e.attr("n");
        var selector = [this.start,this.cssselector+'='+value];
        var opts={db:this.db,selector:selector,local:true};
        var promise=this.$yase("sameId",opts);
        promise.done(function(data){
          $e.find("#paramenu").html(_.template(menutemplate,{selector:selector.join(","),dbs:data}));
        })
      }
      menu.show();
    },   
    leavepara:function(e)  {
      $e=$(e.target);
      while ($e.length && $e[0].tagName!='P') {
        $e=$e.parent();
      }
      $e.find("#paramenu").hide();
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.render();

    }
  };
});
