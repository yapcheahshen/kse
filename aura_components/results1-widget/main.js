define(['underscore','backbone','text!./results.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
   type:"Backbone",
    resize:function() {
      var that=this;
      this.$el.css("height", (window.innerHeight - this.$el.offset().top -18) +"px");
      this.$el.unbind('scroll');
      this.$el.bind("scroll", function() {
        if (that.$el.scrollTop()+ that.$el.innerHeight()+3> that.$el[0].scrollHeight) {
          if (that.displayed+10>that.results.length && that.displayed<that.totalcount) {
            that.sandbox.emit("more","",that.results.length);
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
    totalcount:function(count) {
      this.totalcount=count;
      this.$el.find("#totalcount").html(count)
    },
    initialize: function() {
      $(window).resize( _.bind(this.resize,this) );
     this.sandbox.on("newresult",this.render,this);
     this.sandbox.on("moreresult",this.moreresult,this);
     this.sandbox.on("totalcount",this.totalcount,this);
    }
  }
});
