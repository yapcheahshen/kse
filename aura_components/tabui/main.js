/*
TODO 
allow user to add/remove column
*/
define(['underscore','backbone',
  'text!./texts.tmpl','text!./tabtemplate.tmpl'
  ], 
  function(_,backbone,template,tabtemplate) {
  return {
    type: 'Backbone.nested',
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
      var content=this.$el.find("#tabuicontent #"+tabid);

      var view=content.find("[data-aura-component]").data('hview');
      if (view) view.close();
      content.remove();
      
      tab.remove();
      var model=this.tabs.get(tabid.substring(1));
      this.tabs.remove(model);
      $('#tabs a:last').tab('show');
    },
    removetab:function(m)   {
      this.remove('T'+m.cid);
    },
    showtab:function(e) {
      //$(e.target).find('button').css('display','inline')
      //$(e.relatedTarget).find('button').css('display','none');
    },
    childresize:function() {
      this.sandbox.emit("resize");
    },
    resize:function() {
      var that=this;
      var space=parseInt(this.options.space)||0;
      var newheight=($(window).height() -space);
      this.$el.css("height", newheight+"px");
      var tabcontentheight=newheight-this.$el.find("#tabs").height()-5;

      var tabcontent=this.$el.find("#tabuicontent");
      tabcontent.height(tabcontentheight);
      var children=tabcontent.children();
      for (var i=0;i<children.length;i++) {
          $(children[i]).height(tabcontentheight);
      }
      if (this.timer) clearTimeout(this.timer);
      this.timer=setTimeout( function(){that.childresize()},200);      
    },    
    render:function() {
      var that=this;
      this.html(template);
      setTimeout(function() {
        that.resize();
      },1000);
    },
    addtab:function(m) {
      var widget=m.get('widget');
      var tabid='T'+m.cid;
      var opts=JSON.parse(JSON.stringify(m.attributes));
      var that=this;
      opts.tabid=tabid;
      opts.closable=!opts.keep;

      this.$el.find("#tabs").append( _.template(tabtemplate,opts));
      var tabcontentheight=this.$el.parent().height()-this.$el.find("#tabs").height()-5;
      var tabcontent=this.$el.find("#tabuicontent");
      var newtab='<div id="'+tabid+'" class="tab-pane"><div data-id="'+tabid+'" data-aura-component="'+widget+'"></div></div>';
      tabcontent.append(newtab);
      
      var $newtab=tabcontent.find("#"+tabid);
      $newtab.height(tabcontentheight);
      if (m.get("focus")) this.$el.find("#tabs a[href=#"+tabid+"]").click();

      this.sandbox.start($newtab);
    },
    onReady:function() {
      if (!this.tabs.length) return;
      var m=this.tabs.models[this.tabs.length-1];
      this.sendLastChild("tabinit",m.get('extra'));
    },
    createtabs:function(str) {
      if (!str) return;
      var tabs=str.split(',');
      for (var i in tabs) {
        var w=tabs[i].split('|')
        var widget=w[0];
        var name=w[1].trim();
        if (name.length>12) name=name.substring(0,12)+'...';
        this.tabs.add({widget:widget,name:name,keep:true});
      }
    },
    newtab:function(opts) {
      if (opts.tabsid && opts.tabsid!=this.$el.attr('id')) return;//no my business
      if (opts.name.length>12) opts.name=opts.name.substring(0,12)+'...';
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
      this.model=new Backbone.Model();
      this.tabs=new  Backbone.Collection();
      this.tabs.on("add",this.addtab,this);
      //this.tabs.on("remove",this.removetab,this);

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
