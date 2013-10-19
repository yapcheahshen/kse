define(['underscore','backbone',
  'text!./results.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
   events:{
    "mousemove .resultitem":"resultitemhover",
    "click .opentext":"opentext"
   },
   opentext:function() {
     var $listmenu=this.$el.find("#listmenu");
     var slot=$listmenu.data('slot');
     var tofind=this.$el.find(".results").data('tofind');
     var opts={db:this.db,slot:slot,tofind:tofind}
     this.sandbox.emit("gotosource",opts);
   },
   resultitemhover:function(e) {
    $e=$(e.target);
    while ($e.length && !$e.hasClass('resultitem')) {
      $e=$e.parent();
    }
    var top=$e.offset().top;
    var $listmenu=this.$el.find("#listmenu");
    $listmenu.offset({top:top})
    var slot=$e.find("[data-slot]").data("slot");
    $listmenu.data("slot",slot);
   },
   type:"Backbone",
    resize:function() {
      var that=this;
      var space=parseInt(this.options.space)||0;
      var parentheight=this.$el.parent().height();
      if (!parentheight) parentheight=this.$el.parent().parent().height();
      this.$el.css("height", (parentheight) +"px");
      this.$el.unbind('scroll');
      this.$el.bind("scroll", function() {
        if (that.$el.scrollTop()+ that.$el.innerHeight()+3> that.$el[0].scrollHeight) {
          if (that.displayed+10>that.results.length && that.displayed<that.totalslot) {
            that.sandbox.emit("more"+that.group,that.results.length);
          } else {
            that.loadscreenful();  
          }
        }
      });
    },
    moreresult:function(data) {
      this.results=this.results.concat(data);
      this.loadscreenful();
    },
    loadscreenful:function() {
      var screenheight=this.$el.innerHeight();
      var $listgroup=$(".results");
      var startheight=$listgroup.height();
      if (this.displayed>=this.results.length) return;
      var now=this.displayed||0;
      var H=0;
      for (var i=now;i<this.results.length;i++ ) {
        newitem=_.template(itemtemplate,this.results[i]);
        $listgroup.append(newitem); // this is slow  to get newitem height()
        if ($listgroup.height()-startheight>screenheight) break;

      }
      this.displayed=i+1;
    },
    render: function (data,db,tofind) {
      if (!data) return;
      this.results=[];
      this.db=db;
      this.displayed=0;
      this.results=data;
      this.html(_.template(template,{tofind:tofind}));
      this.resize();
      this.loadscreenful();
    },
    totalslot:function(count,hitcount) {
      var that=this;//totalslot might come later
      setTimeout(function(){
        that.totalslot=count;
        that.$el.find("#totalslot").html(count);
        that.$el.find("#totalhits").html(hitcount);
      },500)
    },
    finalize:function() {
     this.sandbox.off("newresult"+this.group,this.render);
     this.sandbox.off("moreresult"+this.group,this.moreresult);
     this.sandbox.off("totalslot"+this.group,this.totalslot);
     this.sandbox.off("resize"+this.group,this.resize);
     console.log("resultlist finalized")
    },
    initialize: function() {
     this.groupid=this.options.groupid;
     this.group="";
     if (this.options.groupid) this.group="."+this.options.groupid;
     this.sandbox.on("newresult"+this.group,this.render,this);
     this.sandbox.on("moreresult"+this.group,this.moreresult,this);
     this.sandbox.on("totalslot"+this.group,this.totalslot,this);
     this.sandbox.on("resize"+this.group,this.resize,this);
     this.sandbox.once("finalize"+this.group,this.finalize,this);
    }
  }
});