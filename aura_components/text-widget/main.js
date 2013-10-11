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
      yase.getTextByTag({db:this.db, selector:this.start, maxslot:5000},
        function(err,data){
          that.html(_.template(template,data) );
          if (!that.scrollto) return;
          that.$el.animate({
              scrollTop: $(that.scrollto).offset().top-100
          },'slow',function(){
             that.blink($(that.scrollto));  
          });
      })
    },

    model:new Backbone.Model(),
    initialize: function() {
      this.db=this.options.db;
      this.start=this.options.start;
      this.scrollto=this.options.scrollto;
      this.render();
    }
  };
});
