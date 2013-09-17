define(['backbone','text!../config.json'], function(Backbone,config) {
  return {
    type: 'Backbone',
    dosearch:function(tofind) {
      var opts={tofind:tofind};
      var yase=this.sandbox.yase;
      if (!opts.db) opts.db=this.db;
      opts.showtext=true;
      opts.highlight=true;
      this.model.set({tofind:opts.tofind});
      var that=this;
      yase.phraseSearch(opts,function(err,data) {
        that.sandbox.emit('searchresult',data);
      });
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.db=JSON.parse(config).db; 
      if (!this.db) {
        bootbox.alert("please set ydb in config.json")
      }
      this.sandbox.on("tofind.change",this.dosearch,this) ;
    }
  };
});
