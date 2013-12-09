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
      "click .relatedtext":"showrelated",
      "click .closerelated":"closerelated",
      "mouseup .bodytext":"checkselection",
      "dblclick .bodytext":"checkselection"
    },
    commands:{
       "tabinit":"tabinit", 
       "settext":"settext"
    },
    checkselection:function(e)  {
      var sel = this.sandbox.rangy.getSelection().toHtml();
      sel=sel.replace(/<.*?>/g,'').trim();
      if (sel.indexOf(' ')==-1 &&sel) {
        this.sendChildren("selectword",sel);
      }
    },
    closerelated:function(e) {
      $e=$(e.target).parent().parent();
      $e.html('<a class="btn btn-link">'+$e.data('db')+'</a>');
    },
    showrelated:function(e) {
      $e=$(e.target).parent();
      var db=$e.data('db');
      var sel=$e.data('selector');
      if (!sel) return;
      var selectors=sel.split(",");
      this.$yase("getTextByTag", {db:db, selector:selectors}).done(function(data){
        data.db=db;
        $e.html(_.template(relatedtext,data));
      });
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
          if (that.paramenu) that.insertParagraphMenu();
          if (!that.scrollto) return;

          setTimeout(function(){
            var offset=that.$el.find(that.scrollto).offset() || {top:0};

            that.$(".bodytext").animate({
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
      this.paramenu=opts.paramenu;
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
      paragraphs.append("<span id='paramenu'><br/><a class='btn btn-link'>&nbsp</a></span>");
    },
    enterpara:function(e) {
      $e=$(e.target);
      while ($e.length && $e[0].tagName!=this.csstag.toUpperCase()) {
        $e=$e.parent();
      }
      
      var menu=$e.find("#paramenu");
      if (!menu.data('loaded')) {
        var o={}; //find other db with same p[n]
        var value=$e.attr("n");
        var selector = [this.start,this.cssselector+'='+value];
        var opts={db:this.db,selector:selector};
        var promise=this.$yase("sameId",opts);
        promise.done(function(data){
          $e.find("#paramenu").html(_.template(menutemplate,{selector:selector.join(","),dbs:data}));
        })
        menu.data('loaded',true);
      }
      menu.css('visibility','visible');
    },   
    leavepara:function(e)  {
      $e=$(e.target);
      while ($e.length && $e[0].tagName!='P') {
        $e=$e.parent();
      }
      if ($e.find(".openedrelated").length==0) { //no opened related text
        $e.find("#paramenu").css('visibility','hidden');
      }
      
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.render();

    }
  };
});
