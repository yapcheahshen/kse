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
    gotoline:function(start,end) {
      var that=this;
      //console.log('goto',start);
      if (end>start+300) end=start+300;
      var yase=this.sandbox.yase;

      yase.closestTag({db:this.db,tag:'readunit[id]',slot:start},function(err,data){
        var sutraid=data[0].value;
        yase.getTextByTag({db:that.db, tag:'readunit',attribute:'id',value:sutraid},function(err,data2){
          that.html(_.template(template,data2) );
        })
      })
      /*
      this.sandbox.yase.getText({db:this.db,start:start, end:end},
        function(err,data){
          that.render(data);
      });
*/
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
