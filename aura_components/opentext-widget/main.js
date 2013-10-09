define(['underscore','backbone','text!./template.tmpl','text!./linkable.tmpl','text!../config.json'], 
  function(_,Backbone,template,linkable,config) {
  return {
    type: 'Backbone',
    events: {
      "click #opentext":"opentext"
    },
    opentext:function() {
      var $dbs=this.$el.find(".linkdb.active");
      var texts=[];
      for (var i=0;i<$dbs.length;i++) {
        $d=$($dbs[i]);
        texts.push({db:$d.data('db'),start:$d.data('start')});
      }
      this.sandbox.emit("newreader",texts, this.start);
    },
    selected:function(opts) {
      var that=this;
      var prefix=this.linkunit;
      
      if (prefix[prefix.length-1]==']') prefix=prefix.substring(0,prefix.length-1);
      this.sandbox.yase.closestTag({db:this.db,tag:this.linkunit,slot:opts.slot},
        function(err,data){
          var selector=prefix+'='+data[0].value;
          that.start=data[0].value;
          that.linkable.reset();
          that.linkable.add({db:that.db,head:data[0].head,start:selector,active:" active"});
          for (var i in that.linkdb) {
            var selector=prefix+'='+data[0].value;
            that.sandbox.yase.findTag({db:that.linkdb[i], selector:selector},
              function(err,data2){
                that.linkable.add({db:data2.db,head:data2.head,start:selector,active:""});
              })
          }
      });
    },
    render:function() {
      this.html(_.template(template,{}) );
    },
    addlinkable:function(m) {
      this.$el.find("#linkables").append(_.template(linkable,m.attributes));
    },
    removelinkables:function() {
      this.$el.find("#linkables").empty();
    },
    initlinkable:function() {
      this.linkable=new Backbone.Collection();
      this.linkable.on('add',this.addlinkable,this);
      this.linkable.on('reset',this.removelinkables,this);
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.config=JSON.parse(config);
      this.db=this.config.db;
      this.linkdb=this.config.linkdb;
      this.linkunit=this.config.linkunit;
      this.initlinkable();
      if (typeof this.linkdb=='string') this.linkdb=[this.linkdb];
      
      this.render();
      this.sandbox.on('dbslotselected',this.selected,this);
    }
  };
});
