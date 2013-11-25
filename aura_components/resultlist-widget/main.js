define(['underscore','backbone',
  'text!./results.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
   events:{
    "mousemove .resultitem":"resultitemhover",
    "click .opentext":"opentext"
   },
   opentext:function(e) {
     var slot=$(e.target).data('slot');
     var tofind=this.$el.find(".results").data('tofind');
     var searchtype=this.$el.find(".results").data('searchtype');
     var distance=this.$el.find(".results").data('distance');
     var opts={db:this.db,slot:slot,tofind:tofind,
      searchtype:searchtype,distance:distance}
     this.sandbox.emit("gotosource",opts);
   },
   resultitemhover:function(e) {
    $e=$(e.target);
    while ($e.length && !$e.hasClass('resultitem')) {
      $e=$e.parent();
    }
    var top=$e.offset().top;
    var $listmenu=this.$el.find("#listmenu");
    $listmenu.offset({top:top})
    var slot=$e.find("[data-slot]").data("slot");
    $listmenu.data("slot",slot);
   },
  // type:"Backbone",
    resize:function() {
      var that=this;
      var space=parseInt(this.options.space)||0;
      //var height=this.$el.parent().parent().height()-this.$el.offset().top+40;
      //var height=$(window).height()-this.$el.offset().top;
      $(".mainview").scrollTop(0); // need this to prevent vertical scroll from the beginning
      var height=$(window).height()-this.$el.offset().top;
      this.$el.css("height", (height) +"px");
      this.$el.unbind('scroll');
      this.$el.bind("scroll", function() {
        if (that.$el.scrollTop()+ that.$el.innerHeight()+3> that.$el[0].scrollHeight) {
          if (that.displayed+10>that.fetched && that.displayed<that.totalslot) {
            that.sandbox.emit("more"+that.group,that.fetched);
          } else {
            that.loadscreenful();  
          }
        }
      });
    },
    moreresult:function(data) {
      this.results=data;
      this.fetched+=data.matched.length;
      //this.results.docs=this.results.docs.concat(data.docs);
      this.loadscreenful();
    },
    samegroup:function(res,i) {
      var next=i+1;
      var out={count:0,result:res[i]};
      if (next>=res.length) return out;
      if (!res[i].closest) return out; //cannot group
      var p1=res[i].closest[1].value+'.'+res[i].closest[2].value;
      var slot=res[i].slot;
      do {
        var pnext=res[next].closest[1].value+'.'+res[next].closest[2].value;
        if (p1==pnext) {
          if (res[next].slot>slot+1) out.result.text+='...'; //not next slot
          out.result.text+=res[next].text;
          slot=res[next].slot;
          out.count++;
        } else break;
        next++;
      } while (next<res.length);
      return out;
    },
    loadscreenful:function() {
      var screenheight=this.$el.innerHeight();
      var $listgroup=$(".results");
      var startheight=$listgroup.height();
      if (this.displayed>=this.results.doccount) return;
      var now=this.displayed||0;
      var H=0, texts=this.results.texts, sourceinfos=this.results.sourceinfo;
      var showscore=!!this.results.opts.rank;
      this.results.matched.some(function(D,i){

        var o={showscore:showscore,seq:now+i,slot:D[1],score:D[0],text:texts[D[1]],sourceinfo:sourceinfos[i]};
        var newitem=_.template(itemtemplate,o);
        $listgroup.append(newitem); // this is slow  to get newitem height()
        return ($listgroup.height()-startheight>screenheight) ;
      })
      /*
      while (i<this.results.matched.length) {
        var grouped=this.samegroup(this.results,i);
        i+=grouped.count;

        newitem=_.template(itemtemplate,grouped.result);

        $listgroup.append(newitem); // this is slow  to get newitem height()
        if ($listgroup.height()-startheight>screenheight) break;
        i++
      }
      */
      this.displayed+=this.results.matched.length;
    },
    render: function (data,db,tofind,searchtype,distance) {
      if (!data) return;
      this.results=[];
      this.db=db;
      this.displayed=0;
      this.fetched=data.matched.length;
      this.results=data;
      if (typeof tofind!='string') tofind=JSON.stringify(tofind);
      this.html(_.template(template,{tofind:tofind,
        searchtype:searchtype,distance:distance}));
      this.resize();
      this.loadscreenful();
    },
    settotalslot:function(count,hitcount) {
      var that=this;//totalslot might come later
      setTimeout(function(){
        that.totalslot=count;
        that.$el.find("#totalslot").html(count);
        that.$el.find("#totalhits").html(hitcount);
      },500)
    },
    finalize:function() {
     this.sandbox.off("newresult"+this.group,this.render);
     this.sandbox.off("moreresult"+this.group,this.moreresult);
     this.sandbox.off("totalslot"+this.group,this.settotalslot);
     this.sandbox.off("resize",this.resize);
     console.log("resultlist finalized")
    },

    initialize: function() {
     this.groupid=this.options.groupid;
     this.group="";
     if (this.options.groupid) this.group="."+this.options.groupid;
     this.sandbox.on("newresult"+this.group,this.render,this);
     this.sandbox.on("moreresult"+this.group,this.moreresult,this);
     this.sandbox.on("totalslot"+this.group,this.settotalslot,this);
     this.sandbox.on("resize",this.resize,this);
     this.sandbox.once("finalize"+this.group,this.finalize,this);
    }
  }
});
