define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {
      "click p[n]":"syncpara"
    },
    syncpara:function(e) {
      $e=$(e.target);
      var n=$e.attr('n');
      if (this.paralleltext) {
        var offset=$e.offset().top;
        this.sandbox.emit('syncpara.'+this.paralleltext, 
          { scrollto:'p[n="'+n+'"]' , 
            offset: offset,
            from:this.viewid});
      }
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
        selector:this.start,tofind:this.tofind,searchtype:this.searchtype,
         maxslot:5000},
        function(err,data){
          that.html(_.template(template,data) );
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
    fetchbyslot:function() {
      var that=this;
      this.sandbox.yase.getTextRange({db:this.db,
        start:this.start,end:this.start+500,tofind:this.tofind,searchtype:searchtype,
      },function(err,data){
        that.html(_.template(template,{text:data}));
      });
    },
    render:function() {
      this.html(_.template(template,{text:"loading text..."}) );
      if (typeof this.start=='number') this.fetchbyslot();
      else this.fetchbytag();
    },
    scrollpara:function(scrollto, offset) {
      this.$el.scrollTop(0);
      var scrolltop=this.$el.find(scrollto).offset() || {top:offset};
      scrolltop.top-=offset;
      var that=this;
      this.$el.scrollTop(scrolltop.top);
    },
    model:new Backbone.Model(),
    load:function(opts) {
      this.start=opts.start;
      this.tofind=opts.tofind;
      this.searchtype=opts.searchtype;
      this.scrollto=opts.scrollto;
      this.paralleltext=opts.paralleltext;
      this.db=opts.db;
      this.render();
    },
    initialize: function() {
      this.viewid=this.options.id;
      this.sandbox.once('init.'+this.viewid,this.load,this);
      this.sandbox.emit("initialized."+this.viewid,this.viewid);
      this.sandbox.on("scrollto."+this.viewid,this.scrollpara,this);
    }
  };
});
