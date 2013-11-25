define(['underscore','backbone',
  'text!./results.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
   events:{
    "mousemove .resultitem":"resultitemhover",
    "click .opentext":"opentext",
    "click slot":"openslot"
   },
   type:"Backbone",
   getslots:function(n,newslot) {
    var slots=[];
    if (newslot>0) {
      while (newslot) {slots.push(n++);newslot--}
    } else if (newslot<0) {
      while (newslot) {slots.unshift(n--);newslot++}
    } else slots=[n];
    console.log(slots)
    return slots;
   },
   openslot:function(e) {
    var e=$(e.target);
    var newslot=parseInt(e.attr('newslot'));
    var n=parseInt(e.attr('n'),10);
    var slots=this.getslots(n,newslot)

    var promise=this.$yase("getText",{db:this.db,slot:slots});
    promise.done(function(data){
      
      if (newslot) {  
        if (data[0]!='<') data="<div>"+data+"</div>";
        $new=$(data);
        $new.hide();
        if (newslot<0) e.after($new);
        else e.before($new);
        $new.show("fast");
        e.attr('n',n+newslot)
      } else { //abridge , replace
        e.hide().html(data).show("fast");   
        e.attr("expandable",false);     
      }
      
    })
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
   
    resize:function() {
      var that=this;
      $(".mainview").scrollTop(0); // need this to prevent vertical scroll from the beginning
      var height=$(window).height()-this.$el.offset().top;
      this.$el.css("height", (height) +"px");
      this.$el.unbind('scroll');
      this.$el.bind("scroll", function() {
        if (that.$el.scrollTop()+ that.$el.innerHeight()+3> that.$el[0].scrollHeight) {
          that.loadscreenful();
        }
      });
    },
    moreresult:function(data) {
      this.results=data;
      this.fetched+=data.matched.length;
      this.remain=data.matched.length;
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
    getscoreclass:function(score) {
      var scoreclass='label '
        if (score>0.9) scoreclass+='label-success';
        else if (score>0.8) scoreclass+='label-primary';
        else if (score>0.7) scoreclass+='label-info';
        else if (score>0.6) scoreclass+='label-warning';
        else scoreclass+='label-danger';
        return scoreclass;
    },
    //this is quite complicated..no refactor
    loadscreenful:function() {
      var screenheight=this.$el.innerHeight();
      var $listgroup=$(".results");
      var startheight=$listgroup.height();
      if (this.displayed>=this.results.doccount) return;
      
      var H=0, texts=this.results.texts, sourceinfos=this.results.sourceinfo;
      var showscore=!!this.results.opts.rank;
      var that=this;
      var i=this.results.matched.length-this.remain;
      if (this.remain<=0) {
        that.sandbox.emit("more"+that.group,that.fetched);
        return true;
      }
      var startfrom=this.fetched-this.results.matched.length;
      do { 
        D=this.results.matched[i];
        var score=D[0],scoreclass=this.getscoreclass(score);
        var seq=i+startfrom;
        var o={showscore:showscore,seq:seq,
          slot:sourceinfos[i].slot,lastslot:sourceinfos[i].lastslot,
          score:score,text:texts[D[1]],sourceinfo:sourceinfos[i],scoreclass:scoreclass};
        var newitem=_.template(itemtemplate,o);
        $listgroup.append(newitem); // this is slow  to get newitem height()
        that.remain--;
        that.displayed++;
        i++;
        if (that.remain<0) {
          that.sandbox.emit("more"+that.group,that.fetched);
          return true;
        }        
      } while ( $listgroup.height()<screenheight+startheight && that.remain);

    },
    render: function (data,db,tofind,searchtype,distance) {
      if (!data) return;
      this.results=[];
      this.db=db;
      this.displayed=0;
      this.fetched=data.matched.length;
      this.results=data;
      this.remain=data.matched.length;
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
     this.$yase=this.sandbox.$yase.bind(this);
     if (this.options.groupid) this.group="."+this.options.groupid;
     this.sandbox.on("newresult"+this.group,this.render,this);
     this.sandbox.on("moreresult"+this.group,this.moreresult,this);
     this.sandbox.on("totalslot"+this.group,this.settotalslot,this);
     this.sandbox.on("resize",this.resize,this);
     this.sandbox.once("finalize"+this.group,this.finalize,this);
    }
  }
});
