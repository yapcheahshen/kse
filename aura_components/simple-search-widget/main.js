define(['underscore','backbone','text!./template.tmpl',
  'text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone.nested', 
    events: {
    	"input #query":"dosearch",
      "click input[name='vriset']":"selectset",
    },
    commands:{
      "selectdb":"selectdb",
      "enumdb":"enumdb",
      "more":"listresult",
      "gotosource":"gotosource",
      "query.change":"dosearch"
    } ,   
    selectdb:function(db) {
      this.model.set('db',db);
    },
    enumdb:function(dbs) {
      this.model.set('dbs',dbs);
    },
    gotosource:function(opts) {
      var extra={db:opts.db,start:opts.slot,scrollto:"",query:opts.query}
      var query=this.model.get('query');
      var opts={widget:"text-widget",name:query,extra:extra,focus:true};
      this.sandbox.emit("newtab",opts);
    },         
    listresult:function(start) {
      var db=this.model.get('db');
      var dbs=this.model.get('dbs');
      var query=this.model.get('query');

      if (!db || !query) return;
      var opts={db:db,query:query,max:20,start:start||0
        ,output:["text","sourceinfo"],rank:"vsm"};
      this.$yase("search",opts).done(function(data) {
        if (opts.start==0) {
          var count=dbs[db].count;
          this.sendChildren('newresult',data);
          //this.sandbox.emit('totalslot',data.doccount);
        }
        else this.sendChildren('moreresult',data);
        
      });

    },
    dosearch:function() {
        if (this.timer) clearTimeout(this.timer);
        var that=this;
        var query=that.$("#query").val().trim();
        if (!query) {
          this.$el.find("#searchhelp").show();
          this.$el.find("#searchresult").hide();
        } else {
          this.$el.find("#searchhelp").hide();
          this.$el.find("#searchresult").show();
        }
        this.timer=setTimeout(function(){
          localStorage.setItem("query.kse",query);
          that.model.set('query',query);
          that.gethitcount(query);
          that.listresult();
        },500);
        
    },
    showhitcount:function(count,db) {
      if (count) console.log(db,count)
      this.sendChildren("setdbhit",db,count);
    },
    gethitcount:function(query) {
      var that=this;
      var dbs=this.model.get('dbs');
      var promises=[];

      for (var i in dbs) {
        this.$yase("search",{query:query,db:i}).done(function(D){
          that.showhitcount(D.doccount,D.db);
        });
      }

      /*
      for (var i in dbs) {
        promises.push(this.$yase("search",{query:query,db:dbs[i].name}));
      }

      //this is called only when all data arrived
      $.when.apply($,promises).then(function() {
        for (var i in arguments) {
          var D=arguments[i];
          that.showhitcount(D.doccount,D.opts.db);
        }
      });
      */
    },
    render:function() {
      this.html(_.template(template,{ value:this.options.value||""}) );
      this.$el.find("#query").focus();
      this.addChildren();
    },
    initialize: function() {
      var that=this;
      this.model=new Backbone.Model();
      this.config=JSON.parse(config);
      this.model.on("change:db",this.listresult.bind(this,0));
      this.initNested();
      this.render();

      setTimeout(function () {
        var query=localStorage.getItem("query.kse");
        that.$("#query").val(query).focus();
        that.sendChildren("setquery",query);
        that.sendAll("ready");
      }, 1000);
    }
  };
});
