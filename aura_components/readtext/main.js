define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone.nested',
    events: {
      "click p[n]":"syncpara"
    },
    commands:{
      "scrollpara":"scrollpara",
      "settext":"settext"
    },
    scrollpara:function(scrollto, offset,from) {
      if (from==this.cid) return;
      this.$el.scrollTop(0);
      var scrolltop=this.$el.find(scrollto).offset() || {top:offset};
      scrolltop.top-=offset;
      var that=this;
      this.$el.scrollTop(scrolltop.top);
    },

    syncpara:function(e) {
      $e=$(e.target);
      var n=$e.attr('n');
      var offset=$e.offset().top;
      this.sendParent("syncpara",
          { scrollto:'p[n="'+n+'"]' , 
            offset: offset,
            from:this.cid});
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
        selector:this.start,query:this.query,  maxslot:5000},
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
        start:this.start,end:this.start+500,query:this.query
      },function(err,data){
        that.html(_.template(template,{text:data}));
      });
    },
    render:function() {
      this.html(_.template(template,{text:"loading text..."}) );
      if (typeof this.start=='number') this.fetchbyslot();
      else this.fetchbytag();
    },
    model:new Backbone.Model(),
    settext:function(opts) {
      if (!opts) return;
      this.start=opts.start;
      this.query=opts.query;
      this.scrollto=opts.scrollto;
      this.db=opts.db;
      this.render();
    },
    initialize: function() {

    }
  };
});
