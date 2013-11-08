define(['backbone','text!./template.tmpl','text!./itemtemplate.tmpl','text!../config.json'], 
	function(Backbone,template,itemtemplate,config) {
  return {
    type: 'Backbone',
	render:function() {
		this.html(template);
    	this.createtabs(this.config.searchtab);
    	//this.resize();
	} ,
    resize:function() {
      var that=this;
      var space=parseInt(this.options.space)||0;
      this.$el.css("height", (window.innerHeight - this.$el.offset().top -55-space)+"px");
    }, 	
	addtab:function(opts) {
      var widget=opts.widget;
      var pillcount=this.model.get("pillcount")||0;
      pillcount++;
      var pillid='P'+pillcount;
      this.model.set("pillcount",pillcount);

      var opts={pillid:pillid, name:opts.name};

      this.$el.find("#pills").append( _.template(itemtemplate,opts));
      var pillcontent=this.$el.find(".tab-content");
      var newpill=$('<div id="'+pillid+'" class="tab-pane"><div style="overflow-x:hidden" data-aura-widget="'+widget+'"></div></div>');
      pillcontent.append(newpill);
      //this.sandbox.start(pillcontent.find("#"+pillid)); //parent container will start me
  	},

    createtabs:function(tabs) {
    	for (var i in tabs) this.addtab(tabs[i]);
    	this.$el.find("#pills a").first().click();
    },
    model:new Backbone.Model(),
    initialize: function() {
    	this.config=JSON.parse(config);
    	this.render();
    }
  };
});
