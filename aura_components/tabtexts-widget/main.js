define(['underscore','backbone','text!../config.json',
  'text!./texts.tmpl','text!./tabtemplate.tmpl'
  ], 
  function(_,backbone,config,template,tabtemplate) {
  return {
    type: 'Backbone',
    resize:function() {
      var that=this;
      var space=parseInt(this.options.space)||0;
      this.$el.css("height", (window.innerHeight - this.$el.offset().top -55-space)+"px");
      
    },    
    render:function() {
      this.html(template);
      this.resize();
    },
    addtab:function(m) {
      var widget=m.get('widget');
      var tabid='T'+m.cid;
      var opts={target:tabid, name:m.get("name") }
      this.$el.find("#tabs").append( _.template(tabtemplate,opts));
      this.$el.find(".tab-content").append('<div style="overflow:auto" class="tab-pane" id="'+tabid+'"data-aura-widget="'+widget+'"></div>');
      //this.$el.find(".tab-content").append('<div class="tab-pane" id="'+tabid+'">xyz</div>');
    },
    createtabs:function(str) {
      if (!str) return;
      var tabs=str.split(',');
      for (var i in tabs) {
        var w=tabs[i].split('|')
        var widget=w[0];
        var name=w[1]||"noname";
        this.tabs.add({widget:widget,name:name});
      }
    },
    initialize: function() {
      $(window).resize( _.bind(this.resize,this) );
      this.config=JSON.parse(config);
      this.model=new Backbone.Model();
      this.tabs=new  Backbone.Collection();
      this.tabs.on("add",this.addtab,this)
      var tabs=this.options.tabs;
     	this.render();
      this.createtabs(tabs);
      var that=this;
    }
  };
});
