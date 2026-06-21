// ===== math.lab 主程序 =====
const $=s=>document.querySelector(s);
const view=$("#view");
function km(root){ // 渲染 LaTeX
  try{renderMathInElement(root,{delimiters:[
    {left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}],throwOnError:false});}catch(e){}
}
const MAST=["未学","入门","熟悉","掌握","精通"];

Store.load();

// ---- 路由 ----
function setView(name){
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.view===name));
  ({home:Home,map:Map,review:Review,explore:Explore,stats:Stats}[name]||Home)();
  view.scrollTop=0;
}
document.querySelectorAll("#nav a").forEach(a=>a.onclick=()=>setView(a.dataset.view));
$("#resetBtn").onclick=()=>{if(confirm("确定清空所有学习进度？")){Store.reset();refreshChrome();setView("home");}};

function refreshChrome(){
  const due=Store.dueList().length;
  const b=$("#dueBadge");b.textContent=due;b.classList.toggle("show",due>0);
  $("#streakNum").textContent=Store.data.streak||0;
}

// ---- 首页 ----
function Home(){
  const ov=Math.round(Store.overall()*100);
  const due=Store.dueList();
  const genIds=Object.keys(SKILLS).filter(id=>SKILLS[id].gen);
  const learned=genIds.filter(id=>Store.data.cards[id]&&Store.data.cards[id].seen>0).length;
  view.innerHTML=`
   <h1>欢迎回来 👋</h1>
   <div class="sub">高中数学 · 交互训练 · 间隔重复</div>
   <div class="hero">
     <div><h2>今日学习</h2>
       <p>${due.length?`你有 <b style="color:#ffb454">${due.length}</b> 个知识点到了复习时间，趁记忆还在巩固一下。`:"开始一组新练习，每天一点点累积。"}</p></div>
     <button class="btn" id="startBtn">${due.length?"开始复习 ↻":"随机练习 →"}</button>
   </div>
   <div class="grid g3" style="margin-top:18px">
     <div class="card"><div class="label">总体掌握度</div><div class="stat">${ov}<small>%</small></div>
       <div class="bar"><i style="width:${ov}%"></i></div></div>
     <div class="card"><div class="label">已学知识点</div><div class="stat">${learned}<small> / ${genIds.length}</small></div></div>
     <div class="card"><div class="label">累计答题</div><div class="stat">${Store.data.totalDone}<small> 题</small></div>
       <div class="mini" style="margin-top:6px">正确率 ${Store.data.totalDone?Math.round(Store.data.totalRight/Store.data.totalDone*100):0}%</div></div>
   </div>
   <h2>快速开始</h2>
   <div class="grid g3" id="quickPick"></div>`;
  $("#startBtn").onclick=()=>due.length?setView("review"):startSession(genIds);
  const qp=$("#quickPick");
  ["quad_vertex","arith_seq","deriv_poly","trig_value","ineq_quad","vec_dot"].forEach(id=>{
    const s=SKILLS[id];const c=Store.data.cards[id];const m=c?c.mastery:0;
    const d=document.createElement("div");d.className="card click";
    d.innerHTML=`<div class="mini">${s.tag} · ${s.module}</div><div style="font-size:16px;font-weight:600;margin:6px 0">${s.name}</div>
      <div class="bar"><i style="width:${m/4*100}%"></i></div><div class="mini" style="margin-top:6px">${MAST[m]}</div>`;
    d.onclick=()=>startSession([id]);qp.appendChild(d);
  });
}

// ---- 知识地图 ----
function Map(){
  view.innerHTML=`<h1>知识地图</h1><div class="sub">整个高中数学课程 · 点击知识点开始练习（带 <span style="color:#22d3a6">●</span> 的可练，灰色为规划中）</div><div id="mapBody"></div>`;
  const body=$("#mapBody");
  CURRICULUM.forEach((m,mi)=>{
    const genSkills=[];m.chapters.forEach(c=>c.skills.forEach(s=>{if(s.gen)genSkills.push(s.id)}));
    const done=genSkills.filter(id=>Store.data.cards[id]&&Store.data.cards[id].mastery>=3).length;
    const mod=document.createElement("div");mod.className="module"+(mi===0?" open":"");
    let ch="";
    m.chapters.forEach(c=>{
      ch+=`<div class="chap"><div class="chap-name">${c.name}</div><div class="skills">`;
      c.skills.forEach(s=>{
        const card=Store.data.cards[s.id];const mast=card?card.mastery:0;
        const due=card&&card.seen>0&&card.due<=Date.now();
        if(s.gen){
          ch+=`<div class="skill m${mast}" data-skill="${s.id}"><span class="dot"></span>${s.name}${due?'<span class="due">复习</span>':""}</div>`;
        }else{
          ch+=`<div class="skill locked"><span class="dot"></span>${s.name}</div>`;
        }
      });
      ch+=`</div></div>`;
    });
    mod.innerHTML=`<div class="module-h"><span class="tag">${m.tag}</span><span class="mname">${m.name}</span>
      <span class="mprog">${done}/${genSkills.length} 掌握</span></div><div class="chapters">${ch}</div>`;
    mod.querySelector(".module-h").onclick=()=>mod.classList.toggle("open");
    body.appendChild(mod);
  });
  body.querySelectorAll(".skill[data-skill]").forEach(el=>el.onclick=()=>startSession([el.dataset.skill]));
}

// ---- 今日复习 ----
function Review(){
  const due=Store.dueList();
  if(!due.length){
    view.innerHTML=`<h1>今日复习</h1><div class="empty"><div class="big">✓</div>太棒了，今天没有到期的复习。<br><br>
      <button class="btn sec" onclick="setView('map')">去学新知识点</button></div>`;return;
  }
  startSession(due,"复习模式");
}

// ---- 我的进度 ----
function Stats(){
  const genIds=Object.keys(SKILLS).filter(id=>SKILLS[id].gen);
  const rows=genIds.map(id=>{const c=Store.data.cards[id];return{id,s:SKILLS[id],c}})
    .sort((a,b)=>(b.c?b.c.mastery:0)-(a.c?a.c.mastery:0));
  const acc=Store.data.totalDone?Math.round(Store.data.totalRight/Store.data.totalDone*100):0;
  view.innerHTML=`<h1>我的进度</h1><div class="sub">掌握度由间隔重复算法根据你的作答动态评估</div>
   <div class="grid g3">
     <div class="card"><div class="label">连续学习</div><div class="stat">${Store.data.streak||0}<small> 天</small></div></div>
     <div class="card"><div class="label">总答题数</div><div class="stat">${Store.data.totalDone}</div></div>
     <div class="card"><div class="label">总正确率</div><div class="stat">${acc}<small>%</small></div></div>
   </div>
   <h2>各知识点掌握情况</h2><div id="statRows"></div>`;
  const sr=$("#statRows");
  rows.forEach(r=>{
    const m=r.c?r.c.mastery:0;const seen=r.c?r.c.seen:0;
    const d=document.createElement("div");d.className="card";d.style.padding="14px 18px";d.style.marginBottom="10px";
    d.innerHTML=`<div class="row-between"><div><b>${r.s.name}</b> <span class="mini">· ${r.s.module}</span></div>
      <span class="mini">${MAST[m]} · 练过 ${seen} 次</span></div>
      <div class="bar" style="margin-top:10px"><i style="width:${m/4*100}%"></i></div>`;
    d.style.cursor="pointer";d.onclick=()=>startSession([r.id]);
    sr.appendChild(d);
  });
}

// ---- 练习会话 ----
let SES=null;
function startSession(skillIds,label){
  const pool=skillIds.filter(id=>SKILLS[id]&&SKILLS[id].gen);
  if(!pool.length){alert("该知识点暂未开放练习");return;}
  SES={pool,label:label||"练习",count:0,total:pool.length===1?6:Math.min(8,pool.length+3),right:0};
  nextProblem();
}
function nextProblem(){
  if(SES.count>=SES.total){return sessionDone();}
  const sid=SES.pool[Math.floor(Math.random()*SES.pool.length)];
  const s=SKILLS[sid];const prob=GEN[s.gen]();
  SES.cur={sid,s,prob,hintsShown:0,answered:false};
  renderProblem();
}
function renderProblem(){
  const{sid,s,prob}=SES.cur;
  const hasViz=!!prob.viz;
  view.innerHTML=`
   <div class="row-between" style="margin-bottom:18px">
     <div><span class="mini">${SES.label} · ${s.module}</span><h1 style="font-size:20px;margin-top:4px">${s.name}</h1></div>
     <div class="mini">第 ${SES.count+1} / ${SES.total} 题</div>
   </div>
   <div class="bar" style="margin-bottom:20px"><i style="width:${SES.count/SES.total*100}%"></i></div>
   <div class="prob-wrap ${hasViz?'with-viz':''}">
     <div class="prob-card">
       <div class="prob-skill">变式训练 · 自动生成</div>
       <div class="prob-q">${prob.prompt}</div>
       <div id="ansArea"></div>
       <div class="hints" id="hintBox"></div>
       <div id="fb"></div>
       <div class="ans-row" style="margin-top:18px">
         <button class="btn sec sm" id="hintBtn">💡 提示</button>
         <button class="btn sm" id="checkBtn">提交答案</button>
         <button class="btn sec sm" id="skipBtn">不会，看解答</button>
       </div>
     </div>
     ${hasViz?'<div class="viz-card"><div class="mini" style="margin-bottom:8px">图像参考</div><canvas id="pcv"></canvas></div>':''}
   </div>`;
  // 答题区
  const aa=$("#ansArea");
  if(prob.type==="choice"){
    aa.innerHTML='<div class="choices">'+prob.choices.map((c,i)=>`<div class="choice" data-i="${i}">${c}</div>`).join("")+'</div>';
    aa.querySelectorAll(".choice").forEach(el=>el.onclick=()=>{
      if(SES.cur.answered)return;
      aa.querySelectorAll(".choice").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");SES.cur.sel=+el.dataset.i;});
  }else{
    aa.innerHTML=`<div class="ans-row">
        <input id="ansInput" placeholder="${prob.type==='number'?'输入数值（可填分数如 3/2）':'输入答案'}" autocomplete="off">
        <button class="btn sec sm" id="voiceBtn" title="语音输入答案">🎤 语音</button>
        <button class="btn sec sm" id="photoBtn" title="拍照/选图识别题目">📷 拍照</button>
      </div>
      <input type="file" id="photoFile" accept="image/*" capture="environment" style="display:none">
      <div class="mini" id="ioStatus" style="margin-top:8px;min-height:16px"></div>`;
    const inp=$("#ansInput");
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")check();});
    $("#voiceBtn").onclick=()=>InputAids.startVoice((raw,math)=>{
      inp.value=math;$("#ioStatus").textContent="听到：「"+raw+"」→ 已填入（可手动修正后提交）";
    },$("#voiceBtn"));
    $("#photoBtn").onclick=()=>$("#photoFile").click();
    $("#photoFile").onchange=e=>{const f=e.target.files[0];
      InputAids.photoOCR(f,txt=>{},$("#ioStatus"));};
  }
  $("#hintBtn").onclick=showHint;
  $("#checkBtn").onclick=check;
  $("#skipBtn").onclick=()=>reveal(false,true);
  km(view);
  if(hasViz){const{a,b,c}=prob.viz;Viz.plot($("#pcv"),x=>a*x*x+b*x+c,{mark:[[ -b/(2*a), c-b*b/(4*a)]],h:240});}
  if($("#ansInput"))$("#ansInput").focus();
}
function showHint(){
  const cur=SES.cur;if(cur.answered)return;
  if(cur.hintsShown>=cur.prob.hints.length){return;}
  const h=document.createElement("div");h.className="hint";
  h.innerHTML=`<b>提示 ${cur.hintsShown+1}：</b>${cur.prob.hints[cur.hintsShown]}`;
  $("#hintBox").appendChild(h);km(h);cur.hintsShown++;
  if(cur.hintsShown>=cur.prob.hints.length)$("#hintBtn").disabled=true;
}
function check(){
  const cur=SES.cur;if(cur.answered)return;
  let ok;
  if(cur.prob.type==="choice"){
    if(cur.sel==null){return;}
    ok=cur.sel===cur.prob.correct;
    const cs=$("#ansArea").querySelectorAll(".choice");
    cs[cur.prob.correct].classList.add("right");
    if(!ok)cs[cur.sel].classList.add("wrong");
  }else{
    const val=$("#ansInput").value;if(!val.trim())return;
    ok=cur.prob.check(val);
  }
  reveal(ok,false);
}

function reveal(ok,skipped){
  const cur=SES.cur;cur.answered=true;
  $("#hintBtn").disabled=true;$("#checkBtn").disabled=true;$("#skipBtn").disabled=true;
  if($("#ansInput"))$("#ansInput").disabled=true;
  // SM-2 评分：根据是否正确 + 提示用量
  let q;
  if(skipped)q=2;
  else if(ok)q=Math.max(3,5-cur.hintsShown);
  else q=1;
  Store.grade(cur.sid,q);
  if(ok&&!skipped)SES.right++;
  refreshChrome();
  // 反馈
  const fb=$("#fb");
  fb.innerHTML=skipped?`<div class="feedback no">已跳过 · 看懂解答下次就会了</div>`
    :ok?`<div class="feedback ok">✓ 回答正确！${cur.hintsShown?"（用了"+cur.hintsShown+"次提示）":"漂亮，一次答对"}</div>`
    :`<div class="feedback no">✗ 不对，正确答案：<b>${cur.prob.answer||""}</b></div>`;
  // 解答
  const sol=document.createElement("div");sol.className="solution";
  sol.innerHTML=`<h4>📖 分步解答</h4>`+cur.prob.solution.map((s,i)=>`<div class="sol-step"><b>步骤${i+1}</b>${s}</div>`).join("");
  fb.appendChild(sol);
  // 下一题按钮
  const nb=document.createElement("button");nb.className="btn";nb.style.marginTop="18px";
  nb.textContent=SES.count+1>=SES.total?"完成本组 →":"下一题 →";
  nb.onclick=()=>{SES.count++;nextProblem();};
  fb.appendChild(nb);
  km(fb);
  view.querySelector(".bar>i").style.width=((SES.count+1)/SES.total*100)+"%";
}
function sessionDone(){
  const acc=Math.round(SES.right/SES.total*100);
  const msg=acc>=80?"太强了！这组掌握得很扎实 🎉":acc>=50?"不错，再练几组就稳了 💪":"别灰心，难点正是进步的地方 📈";
  view.innerHTML=`<div class="empty"><div class="big">${acc>=80?"🏆":acc>=50?"✨":"📚"}</div>
    <h1>本组完成</h1><div class="sub">${msg}</div>
    <div class="stat" style="margin:10px 0">${SES.right}<small> / ${SES.total} 正确（${acc}%）</small></div><br>
    <button class="btn" id="againBtn">再来一组</button>
    <button class="btn sec" id="backBtn" style="margin-left:10px">返回首页</button></div>`;
  $("#againBtn").onclick=()=>{SES.count=0;SES.right=0;nextProblem();};
  $("#backBtn").onclick=()=>setView("home");
}

// ---- 交互实验室 ----
function Explore(){
  view.innerHTML=`<h1>交互实验室</h1><div class="sub">拖动滑块，实时观察函数图像如何变化 —— 把"看不懂的概念"变成"看得见的图形"</div>
   <div class="toolbar"><span class="pill on" data-lab="quad">二次函数</span><span class="pill" data-lab="trig">正弦型函数</span></div>
   <div id="labBody"></div>`;
  view.querySelectorAll(".pill").forEach(p=>p.onclick=()=>{
    view.querySelectorAll(".pill").forEach(x=>x.classList.remove("on"));p.classList.add("on");lab(p.dataset.lab);});
  lab("quad");
}
function slider(id,label,min,max,step,val){
  return`<div class="slider-row"><label>${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><span class="val" id="${id}v">${val}</span></div>`;
}
function lab(which){
  const b=$("#labBody");
  if(which==="quad"){
    b.innerHTML=`<div class="concept"><h3>二次函数 $f(x)=ax^2+bx+c$</h3>
      <p><b>a</b> 决定开口方向和宽窄（a>0 向上，a<0 向下）；<b>b</b> 影响对称轴位置；<b>c</b> 是与 y 轴的交点。试着拖动看看顶点怎么动。</p></div>
      <div class="viz-card"><div class="viz-eq" id="eq"></div><canvas id="cv"></canvas>
      ${slider("a","a",-3,3,0.1,1)}${slider("b","b",-6,6,0.5,0)}${slider("c","c",-6,6,0.5,-2)}</div>`;
    const upd=()=>{const a=+$("#a").value,bb=+$("#b").value,c=+$("#c").value;
      ["a","b","c"].forEach(k=>$("#"+k+"v").textContent=$("#"+k).value);
      $("#eq").innerHTML=`$f(x)=${a}x^2${bb>=0?"+":""}${bb}x${c>=0?"+":""}${c}$`;km($("#eq"));
      const vx=a!==0?-bb/(2*a):0,vy=a*vx*vx+bb*vx+c;
      Viz.plot($("#cv"),x=>a*x*x+bb*x+c,{mark:a!==0?[[vx,vy]]:[],h:300});};
    ["a","b","c"].forEach(k=>$("#"+k).oninput=upd);upd();
  }else{
    b.innerHTML=`<div class="concept"><h3>正弦型函数 $y=A\\sin(\\omega x+\\varphi)$</h3>
      <p><b>A</b> 振幅（控制高低）；<b>ω</b> 角频率（控制周期，越大越密）；<b>φ</b> 初相（左右平移）。这是物理、信号里到处都有的函数。</p></div>
      <div class="viz-card"><div class="viz-eq" id="eq"></div><canvas id="cv"></canvas>
      ${slider("A","A",0.5,4,0.1,2)}${slider("w","ω",0.5,4,0.1,1)}${slider("p","φ",-3.14,3.14,0.1,0)}</div>`;
    const upd=()=>{const A=+$("#A").value,w=+$("#w").value,p=+$("#p").value;
      $("#Av").textContent=A;$("#wv").textContent=w;$("#pv").textContent=p.toFixed(1);
      $("#eq").innerHTML=`$y=${A}\\sin(${w}x${p>=0?"+":""}${p.toFixed(1)})$`;km($("#eq"));
      Viz.plot($("#cv"),x=>A*Math.sin(w*x+p),{xr:10,yr:5,h:300,color:"#22d3a6"});};
    ["A","w","p"].forEach(k=>$("#"+k).oninput=upd);upd();
  }
}

// ---- 启动 ----
window.setView=setView;
refreshChrome();setView("home");
