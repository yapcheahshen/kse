define(['underscore','backbone',
  'text!./template.tmpl','text!./item.tmpl'], 
 function(_,Backbone,template,itemtemplate) {
  return {
   type:"Backbone.nested",
   events:{
    "mousemove .resultitem":"resultitemhover",
    "click .opentext":"opentext",
    "click slot":"openslot"
   },
   commands:{
     "newresult":"render",
     "moreresult":"moreresult",
     "totalslot":"settotalslot"
   },
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
     var opts={db:this.db,slot:slot,query:this.query};
     this.sendParent("gotosource",opts);
   },
   resultitemhover:function(e) {
    $e=$(e.target);
    while ($e.length && !$e.hasClass('resultitem')) {
      $e=$e.parent();
    }
    var top=$e.offset().top;
    var $listmenu=this.$("#listmenu");
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
      this.R=data;
      this.fetched+=data.result.length;
      this.remain=data.result.length;
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
      var scoreclass='';
        if (score>0.9) scoreclass+='success';
        else if (score>0.8) scoreclass+='primary';
        else if (score>0.7) scoreclass+='info';
        else if (score>0.6) scoreclass+='warning';
        else scoreclass+='danger';
        return scoreclass;
    },
    //this is quite complicated..no refactor
    loadscreenful:function() {
      var screenheight=this.$el.innerHeight();
      var $listgroup=$(".results");
      var startheight=$listgroup.height();
      if (this.displayed>=this.R.doccount) return;
      
      var H=0, showscore=!!this.R.opts.rank;
      var that=this;
      if (!this.R.result.length)  return;
      var start=this.R.result.length-this.remain;

      if (this.remain<=0) {
        that.sendParent("needmore",that.fetched);
        return true;
      }
      var startfrom=this.fetched-this.R.result.length;
      var i=start;
      do {
        var D=this.R.result[i];
        var score=D.score,scoreclass=this.getscoreclass(score);
        var seq=i+startfrom;
        var previousmore=!this.R.opts.groupunit;
        var o={showscore:showscore,seq:seq,previousmore:previousmore,
          slot:D.slot,lastslot:D.lastslot,
          score:score,text:D.text,sourceinfo:D.sourceinfo,scoreclass:scoreclass};
        var newitem=_.template(itemtemplate,o);
        $listgroup.append(newitem); // this is slow  to get newitem height()
        that.remain--;
        that.displayed++;
        i++;
        if (that.remain<0) {
          that.sendParent("needmore",that.fetched);
          return true;
        } 

      } while ( $listgroup.height()<screenheight+startheight && that.remain);

    },
    render: function (data) {//,db,tofind,searchtype,distance) {
      if (!data) return;
      this.db=data.db;
      this.displayed=0;
      this.fetched=data.result.length;
      this.R=data;
      this.remain=data.result.length;
      this.query=data.opts.query;
      this.html(_.template(template,{}));
      this.resize();
      this.loadscreenful();
    },
    settotalslot:function(count,hitcount) {
      var that=this;//totalslot might come later
      setTimeout(function(){
        that.totalslot=count;
        that.$("#totalslot").html(count);
        that.$("#totalhits").html(hitcount);
      },500)
    },
    initialize: function() {
     //this.sandbox.on("resize",this.resize,this);
     this.initNested();
    }
  }
});
