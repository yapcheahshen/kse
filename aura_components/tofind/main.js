define(['underscore','text!./tofind.tmpl'], 
  function(_,template) {
  return {
    type: 'Backbone.nested',
    events: {
    	"keyup #query":"dosearch",
    },
    commands:{
      "setquery":function(query) {
        this.$("#query").val(query);
        this.dosearch();
      }
    },
    dosearch:function() {
        if (this.timer) clearTimeout(this.timer);
        var that=this;
        this.timer=setTimeout(function(){
          var query=that.$("#query").val();
          that.sendParent("query.change",{query:query});
        },300);
    },
    render:function() {
      this.html(_.template(template,{ value:this.options.value||""}) );
      this.$el.find("#tofind").focus();
    },
    initialize: function() {
     	this.render();
    }
  };
});
