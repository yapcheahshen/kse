define(['underscore','backbone','text!./template.tmpl',
  'text!../config.json'], 
  function(_,Backbone,template,config) {    
  return {
    type:'Backbone',
    events: {
    	"input #query":"dosearch",
      "click #clearquery":"clearquery",
      //"click input[name='vriset']":"selectdb",
      "click input[name='rank']":"setorder",
    },
    setorder:function(e) {
      var rank=$(e.target).data('order')
      this.model.set('rank',rank);
    },
    clearquery:function() {
      this.$el.find("#query").val("").focus();
      this.dosearch();
    },
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
    searchreply:function(res) {
        if (res.opts.start==0) {
          var db=res.opts.db;
          var dbs=this.model.get('dbs');
          var count=dbs[db].count;
          this.sandbox.emit('newresult',res,db,res.opts.query);
          this.sandbox.emit('totalslot',res.scorecount?res.scorecount:res.doccount);
        }
        else this.sandbox.emit('moreresult',res);
    },
    listresult:function(start) {
      var that=this;
      var db=this.model.get('db');
      var dbs=this.model.get('dbs');
      var query=this.model.get('query');
      var rank=this.model.get('rank');
      if (!db || !query) return;
      
      var opts={db:db,query:query,rank:rank,output:["docs","texts","sourceinfo"],
        max:20,start:start||0};
        if (!this.$yase) {
          throw 'not $yase'
        } else {
          this.$yase("search",opts).done(this.searchreply);    
        }
      
    },
    dosearch:function() {
        if (this.timer) clearTimeout(this.timer);
        var that=this;
        var query=that.$el.find("#query").val().trim();
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
        //  that.gethitcount(query);
          that.listresult();
        },500);
        
    },
    showhitcount:function(count,db) {
      this.sandbox.emit('setdbhit',db,count);
    },
    /*
    gethitcount:function(query) {
      var that=this;
      var dbs=this.model.get('dbs');
      for (var i in dbs) {
        this.sandbox.yase.phraseSearch({tofind:tofind,countonly:true,db:dbs[i].name},
          (function(db) {
            return function(err,data){
             that.showhitcount(data.hitcount,db);
             dbs[db].count=data;
            }
          })(i)
        );
      }
    },
    */
    render:function() {
      this.html(_.template(template,{ value:this.options.value||""}) );
      this.$el.find("#query").focus();
    },
    initialize: function() {
     	this.render();
      var that=this;
      this.model=new Backbone.Model();
      this.config=JSON.parse(config);
      this.sandbox.on('selectdb',this.selectdb,this);
      this.sandbox.on('enumdb',this.enumdb,this);
      this.model.on('change:db',this.listresult.bind(this,0));
      this.model.on('change:rank',this.listresult.bind(this,0));
      this.sandbox.on('more',this.listresult ,this);
      this.sandbox.on("gotosource",this.gotosource,this);
      this.$yase=this.sandbox.$yase.bind(this);
      setTimeout(function() {
        that.$el.find("#query").val(localStorage.getItem("query.kse"));
        that.dosearch();

      },500)
    },
    initialized:function() {
        this.$el.find("#query").val(localStorage.getItem("query.kse"));
        this.dosearch();

    }

  };
});
