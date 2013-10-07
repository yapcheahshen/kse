define(['underscore','backbone','text!./text.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone',
    events: {

    },
    resize:function(){
      parentheight=this.$el.parent().height();
      if (!parentheight) parentheight=this.$el.parent().parent().height();
     // if (parentheight<50) newparentheight=this.$el.parent().parent().parent().height();
    //  if (newparentheight && newparentheight>parentheight) parentheight=newparentheight;
      this.$el.css("height", (parentheight) +"px");      
    },
    render:function() {
      this.html(_.template(template,{text:"default text<br/>default text<br/>default text<br/>default text<br/>default text<br/>default text<br/>default text"+_.uniqueId()}) );
      this.resize();
    },
  

    model:new Backbone.Model(),
    initialize: function() {
      $(window).resize( _.bind(this.resize,this) );
      this.config=JSON.parse(config);
      this.db=this.config.db;
      this.render();
      console.log('text initialized')
      this.sandbox.on('gotoline',this.gotoline,this);
    }
  };
});
