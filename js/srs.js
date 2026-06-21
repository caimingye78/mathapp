// ===== 间隔重复 (SM-2 简化版) + 进度存储 =====
const STORE_KEY="mathlab_v1";
const DAY=86400000;

const Store={
  data:null,
  load(){
    try{this.data=JSON.parse(localStorage.getItem(STORE_KEY))}catch(e){this.data=null}
    if(!this.data)this.data={cards:{},streak:0,lastDay:null,totalDone:0,totalRight:0};
    return this.data;
  },
  save(){localStorage.setItem(STORE_KEY,JSON.stringify(this.data));},
  reset(){localStorage.removeItem(STORE_KEY);this.load();},
  // 获取某 skill 的卡片，无则初始化
  card(id){
    if(!this.data.cards[id])this.data.cards[id]={ef:2.5,reps:0,interval:0,due:Date.now(),mastery:0,seen:0,right:0};
    return this.data.cards[id];
  },
  // 记录一次作答。quality 0~5
  grade(id,quality){
    const c=this.card(id);c.seen++;this.data.totalDone++;
    if(quality>=3){this.data.totalRight++;c.right++;
      c.reps++;
      if(c.reps===1)c.interval=1;else if(c.reps===2)c.interval=3;
      else c.interval=Math.round(c.interval*c.ef);
      c.mastery=Math.min(4,c.mastery+1);
    }else{c.reps=0;c.interval=1;c.mastery=Math.max(0,c.mastery-1);}
    c.ef=Math.max(1.3,c.ef+(0.1-(5-quality)*(0.08+(5-quality)*0.02)));
    c.due=Date.now()+c.interval*DAY;
    this.touchStreak();this.save();
    return c;
  },
  touchStreak(){
    const today=new Date().toDateString();
    if(this.data.lastDay!==today){
      const y=new Date(Date.now()-DAY).toDateString();
      this.data.streak=this.data.lastDay===y?this.data.streak+1:1;
      this.data.lastDay=today;
    }
  },
  dueList(){ // 到期需复习的 skill id（已练过且 due<=now）
    const now=Date.now();
    return Object.keys(this.data.cards).filter(id=>this.data.cards[id].seen>0&&this.data.cards[id].due<=now);
  },
  // 整体掌握度 0~1（基于有生成器的知识点）
  overall(){
    const ids=Object.keys(SKILLS).filter(id=>SKILLS[id].gen);
    if(!ids.length)return 0;
    let s=0;ids.forEach(id=>{const c=this.data.cards[id];s+=c?c.mastery/4:0;});
    return s/ids.length;
  }
};
window.Store=Store;
