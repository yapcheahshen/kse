define(['underscore','backbone','text!../config.json',
  'text!./texts.tmpl','text!./tabtemplate.tmpl'
  ], 
  function(_,backbone,config,template,tabtemplate) {
  return {
    type: 'Backbone',
    events:{
      'view':'viewevent',
      'show.bs.tab a[data-toggle="tab"]':"showtab",
      'click a button':'closetab'
    },
    viewevent:function() {
      console.log('view')
    },
    closetab:function(e) {
      var tab=$(e.target).parent();
      var tabid=tab.attr('href').substring(1);
      this.remove(tabid);
    },
    remove:function(tabid) {
      var tab=this.$el.find("#tabs a[href='#"+tabid+"']");
      if (!tab) {
        console.error('tab id not found '+tabid);
        return;
      }
      tab.remove();
      var tabcontent=this.$el.find(".tab-content #"+tabid);
      var model=tabcontent.data('model');
      this.tabs.remove(model);
      tabcontent.remove();
      $('#tabs a:first').tab('show');
    },
    removetab:function(m)   {
      this.remove('T'+m.cid);
    },
    showtab:function(e) {
      $(e.target).find('button').css('display','inline')
      $(e.relatedTarget).find('button').css('display','none');
    },
    childresize:function() {
      this.sandbox.emit("resize");
    },
    resize:function() {
      var that=this;
      var space=parseInt(this.options.space)||0;
      this.$el.css("height", (window.innerHeight - this.$el.offset().top-space)+"px");
      if (this.timer) clearTimeout(this.timer);
      this.timer=setTimeout( function(){that.childresize()},300);      
    },    
    render:function() {
      this.html(template);
      this.resize();
    },
    addtab:function(m) {
      var widget=m.get('widget');
      var tabid='T'+m.cid;
      var opts=JSON.parse(JSON.stringify(m.attributes));
      var that=this;
      opts.tabid=tabid;
      opts.closable=!opts.keep;

      this.$el.find("#tabs").append( _.template(tabtemplate,opts));
      var tabcontent=this.$el.find(".tab-content");
      var extra='';
      var E=m.get('extra');
      for (var i in E) {
        extra+='data-'+i+'="'+E[i]+'" ';
      }
      var newtab=$('<div id="'+tabid+'" class="tab-pane"><div '+extra+' data-viewid="'+tabid+'"data-aura-widget="'+widget+'"></div></div>');
      tabcontent.append(newtab);
      
      this.sandbox.start(tabcontent.find("#"+tabid));
      if (m.get("focus")) this.$el.find("#tabs a[href=#"+tabid+"]").click();

      setTimeout(function(){
        that.sandbox.emit("settext."+tabid,m.get('cols'));
      },100);
            

    },
    createtabs:function(str) {
      if (!str) return;
      var tabs=str.split(',');
      for (var i in tabs) {
        var w=tabs[i].split('|')
        var widget=w[0];
        var name=w[1]||"noname";
        this.tabs.add({widget:widget,name:name,keep:true});
      }
    },
    newtab:function(opts) {
      if (opts.tabsid!=this.$el.attr('id')) return;//no my business
      this.tabs.add(opts);
    },
    inittab:function(setting) {
      var tabs=setting.split(',');
      for (var i in tabs) {
        this.createtabs(tabs[i]);
      }
      this.$el.find("#tabs a").first().click(); //switch back to first page
    },
    initialize: function() {
      $(window).resize( _.bind(this.resize,this) );
      this.config=JSON.parse(config);
      this.model=new Backbone.Model();
      this.tabs=new  Backbone.Collection();
      this.tabs.on("add",this.addtab,this);
      this.tabs.on("remove",this.removetab,this);

      this.sandbox.on("newtab",this.newtab,this);
     	this.render();
      var that=this;
      setTimeout(function(){
        if (that.options.initTab) {
          that.inittab(that.options.initTab);
        }
      },100)
    }
  };
});
