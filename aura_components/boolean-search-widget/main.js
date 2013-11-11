
define(['underscore','backbone','text!./template.tmpl','text!../config.json'], 
  function(_,Backbone,template,config) {
  return {
    type: 'Backbone', 
    events: {
      "keyup #tofind":"checkenter",
      "click #cleartofind":"cleartofind",
      "click .btnexample":"setexample"
    },
    listresult:function(start) {
      var that=this;
      var db=this.model.get('db');
      var dbs=this.model.get('dbs');
      var distance=this.model.get('distance');
      var tofind=this.model.get('tofind');
      if (!db || !tofind) return;
      var opts={db:db,tofind:tofind,distance:distance,
         highlight:true,maxcount:20,start:start||0,sourceinfo:true};
      this.sandbox.yase.boolSearch(opts,function(err,data) {
        if (opts.start==0) {
          var count=dbs[db].count;
          that.sandbox.emit('newresult',data,db,tofind,"boolSearch",distance);
          that.sandbox.emit('totalslot',count.count,count.hitcount);
        }
        else that.sandbox.emit('moreresult',data);
        
      });

    },
    selectdb:function(db) {
      this.model.set('db',db);
    },

    setexample:function(e) {
      $e=$(e.target);
      this.sandbox.emit("boolsearch.setexample",$e.data('query'));
    },
    tofind2string:function(q) {
      var out="",OP={"followby":"@","notfollowby":"@!","nearby":"~","nearby":"~!"};
      for (var i=0;i<q.length;i++) {
        if (typeof q[i]=='string') {
          out+=OP[q[i]];
        } else {
          out+=q[i].join("|")+',';
        }
      }
      return out;
    },
    showhitcount:function(res,db) {
      this.sandbox.emit('setdbhit',db,res.hitcount); 
      if (db==this.model.get("db")) {
        this.listresult();
      }
    },
    gethitcount:function() {
      var that=this;
      var tofind=this.model.get("tofind");
      var distance=this.model.get("distance");

      var dbs=this.model.get('dbs');
      for (var i in dbs) {
        var opts={db:i,tofind:tofind,distance:distance,countonly:true};
        this.sandbox.yase.boolSearch(opts,
          (function(db) {
            return function(err,data){
              dbs[db].count=data;
             that.showhitcount(data,db);
            }
          })(opts.db)
        );
      }
    },
    newquery:function(tofind,distance) {
      if (!tofind) return;
      if (!tofind.length) return;
      this.model.set("tofind",tofind);
      this.model.set("distance",distance);
      this.gethitcount();
    },
    enumdb:function(dbs) {
      this.model.set('dbs',dbs);
    },
    render:function() {
      this.html(_.template(template,{ value:this.options.value||""}) );
    },
    initialize: function() {
     	this.render();
      var that=this;
      this.model=new Backbone.Model();
      this.config=JSON.parse(config);
      this.db=this.config.db;
      this.model.on('change:db',function(){that.listresult()},this);      
      this.sandbox.on('selectdb',this.selectdb,this);
      this.sandbox.on('enumdb',this.enumdb,this);      
      this.sandbox.on('more',this.listresult ,this);
      this.sandbox.on("newboolquery",this.newquery,this);
    }
  };
});