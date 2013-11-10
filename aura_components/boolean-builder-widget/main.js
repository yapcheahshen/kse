/* 
   Contruct Boolean Query
   OR opeartion has higher precedence than others
*/
define(['underscore','backbone','text!./template.tmpl',
  'text!./orphrase.tmpl','text!./newphrase.tmpl'], 
  function(_,Backbone,template,orphrasetemplate,newphrasetemplate) {
  return {
    type: 'Backbone', 
    events: {
      "click #newphrase":"newphrase",
      "click #removephrase":"removephrase",
      "click #searchmode":"searchmode",
      "click #orphrase":"orphrase",
      "click #removeorphrase":"removeorphrase",
      "input .tofind":"querychange",
      "click #btnexample":"example",
      "click .slotdistance":"distancechange"
    },
    distancechange:function(e) {
      var distance=$(e.target).data('distance');
      this.model.set("distance",distance);
    },
    example:function() {
      this.render();
      $i=this.$el.find(".tofind");
      $i.val("sankhara");

      this.$el.find("#newphrase").click();
      $(':focus').val("anicca");

      $(':focus').parent().find("#orphrase").click();
      $(':focus').val("anatta");

      this.querychange();
    },
    removeorphrase:function(e) {
      $e=$(e.target);
      $e.parent().remove();
      this.querychange();
    },
    orphrase:function(e) {
      $e=$(e.target);
      var $input=$e.parent().parent().find("input").last();
      if ($input.val()) {
        $input.parent().after(_.template(orphrasetemplate,{}) );  
      } 
      $e.parent().parent().find("input").last().focus();
    },
    searchmode:function(e) {
      $e=$(e.target);
      var mode=$e.data('mode');
      var text=$e.html();
      var $btn=$e.parent().parent().parent().find("button");
      $btn.html(text);
      $btn.data('mode',mode);
      this.querychange();
    },
    removephrase:function(e) {
      $e=$(e.target);
      $e.parent().parent().remove();
      this.querychange();
    },
    newphrase:function(e) {
      $e=$(e.target)
      var $phrases=this.$el.find("#phrases");
      var $input=$e.parent().parent().find("input").last();
      if ($phrases.find("input").last().val()) {
        $phrases.append(_.template(newphrasetemplate,{}) );  
      }
      $phrases.find("input").last().focus();
    },
    constructquery:function() {
      var phrases=this.$el.find("#phrases");
      var $ip=phrases.find("input");
      var querygroups=[[]];
      var lastop='';

      for (var i=0;i<$ip.length;i++) {
        var $i=$($ip[i]);
        var mode=$i.data('mode');
        if (mode=='and') {
          if (querygroups[querygroups.length-1].length) {
            if (lastop) querygroups.push(lastop);
            querygroups.push([]);            
          }
          lastop=$i.parent().parent().find('button').data('mode');
        }
        if ($i.val()) querygroups[querygroups.length-1].push( $i.val());
      }
      if (querygroups[querygroups.length-1].length==0) {
        querygroups.pop();
      } else {
        if (lastop) querygroups.push(lastop);  
      }
      this.sandbox.emit('newboolquery', querygroups, this.model.get("distance"));
    },
    querychange:function() {
        if (this.timer) clearTimeout(this.timer);
        this.$el.find("#openresult").addClass('disabled');
        var that=this;
        this.timer=setTimeout(function(){
          that.constructquery();  
        },800);
    },
    render:function() {
      this.html(_.template(template,{ value:this.options.value||""}) );
    },
    model: new Backbone.Model(),
    initialize: function() {
     	this.render();
      var dis=this.$el.find("input.slotdistance[checked]").data('distance');
      this.model.set("distance",dis);
      this.model.on("change:distance",this.querychange,this);

    }
  };
});
