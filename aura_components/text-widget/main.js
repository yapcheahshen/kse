define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {

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
        selector:this.start,tofind:this.tofind,
         maxslot:5000},
        function(err,data){
          that.html(_.template(template,data) );
          if (!that.scrollto) return;

          setTimeout(function(){
            that.$el.animate({
                scrollTop: $(that.scrollto).offset().top-100
            },'slow',function(){
               that.blink($(that.scrollto));  
            });            
          },500);
      })      
    },
    fetchbyslot:function() {
      var that=this;
      this.sandbox.yase.getTextRange({db:this.db,
        start:this.start,end:this.start+500,tofind:this.tofind
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
    load:function(opts) {
      this.start=opts.start;
      this.tofind=opts.tofind;
      this.scrollto=opts.scrollto;
      this.db=opts.db;
      this.render();
    },
    initialize: function() {
      this.viewid=this.options.viewid;
      this.sandbox.once('init.'+this.viewid,this.load,this);
      this.sandbox.emit("initialized."+this.viewid,this.viewid);
    }
  };
});
