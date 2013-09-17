define(['underscore','text!./tofind.tmpl'], 
  function(_,template,config) {
  return {
    type: 'Backbone',
    events: {
    	"keyup #tofind":"dosearch",
    },
    dosearch:function() {
        if (this.timer) clearTimeout(this.timer);
        var that=this;
        this.timer=setTimeout(function(){
          var tofind=that.$("#tofind").val();
          that.sandbox.emit('tofind.change',tofind);
          if  (tofind) {
            localStorage.setItem("tofind",tofind);
          }
        },300);
    },
    render:function() {
      this.html(_.template(template,{ value:this.options.value||""}) );
      this.$el.find("#tofind").focus();
    },
    initialize: function() {
     	this.render();
      var that=this;
      setTimeout(function(){
        that.$("#tofind").val(localStorage.getItem("tofind"));
        that.dosearch();
      },100)
    }
  };
});
