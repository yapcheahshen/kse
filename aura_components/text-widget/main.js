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
    render:function() {
      var that=this;
      var yase=this.sandbox.yase;
      this.html(_.template(template,{text:"loading text..."}) );
      yase.getTextByTag({db:this.db, 
        selector:this.start,tofind:this.tofind,
         maxslot:5000,},
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

    model:new Backbone.Model(),
    load:function(opts) {
      this.start=opts.start;
      this.tofind=opts.tofind;
      this.scrollto=opts.scrollto;
      this.db=opts.db;
      this.render();
    },
    initialize: function() {
      this.viewid=this.options.id;
      this.sandbox.once('load.'+this.viewid,this.load,this);
      this.sandbox.emit("initialized."+this.viewid,this.viewid);
    }
  };
});
