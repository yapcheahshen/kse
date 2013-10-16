define(['underscore','backbone','text!./results.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
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
            that.sandbox.emit("more"+this.group,"",that.results.length);
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
    render: function (data) {
      if (!data) return;
      this.results=[];
      this.displayed=0;
      this.results=data;
      this.$el.html(template);
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

    initialize: function() {
     $(window).resize( _.bind(this.resize,this) );
     var this.groupid=;
     this.group="";
     if (this.options.groupid) this.group="."+this.options.groupid;
     this.sandbox.on("newresult"+this.group,this.render,this);
     this.sandbox.on("moreresult"+this.group,this.moreresult,this);
     this.sandbox.on("totalslot"+this.group,this.totalslot,this);
    }
  }
});
