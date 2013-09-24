define(['underscore','backbone','text!./results.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
   type:"Backbone",
    render: function (data) {
      if (!data) return;
      this.$el.html(template);
      this.$el.find("#totalcount").html(data.length);
      $results=this.$el.find(".results");
      for (var i in data) {
        $results.append(_.template(itemtemplate,data[i]));
      }
    },
    initialize: function() {
     this.sandbox.on("searchresult",this.render,this);
     this.$el.css("height", (window.innerHeight - this.$el.offset().top -18) +"px");
    }
  }
});
