// ===== 工具 =====
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const nz=(a,b)=>{let x;do{x=ri(a,b)}while(x===0);return x;};
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1;}
function frac(n,d){if(d<0){n=-n;d=-d}const g=gcd(n,d);n/=g;d/=g;if(d===1)return""+n;return n+"/"+d;}
function term(c,p){if(c===0)return"";let s=c>0?"+":"-";let a=Math.abs(c);let v=p===0?"":(p===1?"x":"x^{"+p+"}");if(a===1&&p!==0)a="";return s+a+v;}
function poly(coeffs){let s="";for(let p=coeffs.length-1;p>=0;p--){s+=term(coeffs[p],p);}s=s.replace(/^\+/,"");return s||"0";}
function numEq(input,val){
  input=(input||"").trim().replace(/\s/g,"");if(!input)return false;
  let v;if(input.includes("/")){const[p,q]=input.split("/");v=parseFloat(p)/parseFloat(q);}
  else v=parseFloat(input);
  if(isNaN(v))return false;return Math.abs(v-val)<1e-6;
}
const norm=s=>(s||"").toLowerCase().replace(/\s|\*|\\/g,"").replace(/\^/g,"");

const GEN={};

GEN.set_op=()=>{
  const A=[...new Set([ri(1,6),ri(1,6),ri(1,6)])].sort((x,y)=>x-y);
  const B=[...new Set([ri(2,8),ri(2,8),ri(2,8)])].sort((x,y)=>x-y);
  const op=pick(["∩","∪"]);
  const res=op==="∩"?A.filter(x=>B.includes(x)):[...new Set([...A,...B])].sort((x,y)=>x-y);
  const ans="{"+res.join(",")+"}";
  return{prompt:`已知 $A=\\{${A}\\},\\ B=\\{${B}\\}$，求 $A${op}B$。`,
    answer:ans,type:"text",check:i=>{const f=x=>norm(x).replace(/，/g,",").replace(/[{}]/g,"");return f(i)===f(ans);},
    hints:[op==="∩"?"交集 = 两个集合都有的元素":"并集 = 两集合所有元素合并，重复只算一次","逐个检查元素，填写格式如 {1,2,3}"],
    solution:[`A=\\{${A}\\}，B=\\{${B}\\}`,op==="∩"?"取两集合公共元素":"合并全部元素并去重",`所以 $A${op}B=${ans}$`]};
};

GEN.func_domain=()=>{
  const a=nz(1,4),b=ri(1,6);
  return{prompt:`求函数 $f(x)=\\sqrt{${a}x-${b}}$ 的定义域。`,
    answer:`x≥${frac(b,a)}`,type:"text",
    check:i=>{const m=(i||"").match(/-?\d+(\.\d+)?(\/\d+)?/);return !!m&&numEq(m[0],b/a);},
    hints:["根号下必须 ≥ 0","令 "+a+"x − "+b+" ≥ 0，解出 x"],
    solution:[`要使根式有意义需 $${a}x-${b}\\ge0$`,`解得 $x\\ge ${frac(b,a)}$`,`定义域为 $[${frac(b,a)},+\\infty)$`]};
};

GEN.func_parity=()=>{
  const t=pick(["odd","even","none"]);let f,name;
  if(t==="odd"){f=`f(x)=x^{${pick([3,5])}}+${ri(2,5)}x`;name="奇函数";}
  else if(t==="even"){f=`f(x)=x^{${pick([2,4])}}+${ri(1,5)}`;name="偶函数";}
  else{f=`f(x)=x^{2}+${ri(2,5)}x`;name="非奇非偶";}
  const ch=["奇函数","偶函数","非奇非偶"];
  return{prompt:`判断函数 $${f}$ 的奇偶性。`,type:"choice",choices:ch,correct:ch.indexOf(name),
    hints:["先看定义域是否关于原点对称","计算 $f(-x)$：若 $=f(x)$ 为偶，$=-f(x)$ 为奇"],
    solution:[`定义域为 $\\mathbb{R}$，关于原点对称`,`代入 $f(-x)$ 与 $f(x)$、$-f(x)$ 比较`,`结论：是${name}`]};
};

GEN.exp_log=()=>{
  const b=pick([2,3,5]),n=ri(2,4),v=Math.pow(b,n);
  return{prompt:`计算 $\\log_{${b}}${v}$ 的值。`,answer:""+n,type:"number",check:i=>numEq(i,n),
    hints:[`问的是：${b} 的几次方等于 ${v}？`,`$${b}^{?}=${v}$`],
    solution:[`$\\log_{${b}}${v}$ 即求 $${b}^{x}=${v}$`,`因为 $${b}^{${n}}=${v}$`,`所以 $\\log_{${b}}${v}=${n}$`]};
};

GEN.quad_vertex=()=>{
  const a=nz(-3,3),h=ri(-4,4),k=ri(-5,5);
  const b=-2*a*h,c=a*h*h+k;
  const ext=a>0?"最小值":"最大值";
  return{prompt:`求二次函数 $f(x)=${poly([c,b,a])}$ 的${ext}。`,
    answer:""+k,type:"number",check:i=>numEq(i,k),viz:{a,b,c},
    hints:["配方或用顶点公式 $x=-\\dfrac{b}{2a}$","顶点纵坐标 $\\dfrac{4ac-b^2}{4a}$ 即为最值"],
    solution:[`$a=${a},b=${b},c=${c}$`,`对称轴 $x=-\\dfrac{${b}}{2\\times${a}}=${frac(-b,2*a)}$`,`代入得顶点 $(${frac(-b,2*a)},${k})$`,`$a${a>0?">":"<"}0$，开口向${a>0?"上":"下"}，${ext}为 $${k}$`]};
};

GEN.quad_roots=()=>{
  const r1=nz(-5,5),r2=nz(-5,5);const b=-(r1+r2),c=r1*r2;
  return{prompt:`解方程 $x^2${term(b,1)}${term(c,0)}=0$。`,
    answer:`x=${Math.min(r1,r2)} 或 x=${Math.max(r1,r2)}`,type:"text",
    check:i=>{const m=(i||"").match(/-?\d+/g)||[];const s=m.map(Number);return s.includes(r1)&&s.includes(r2);},
    hints:[`判别式 $\\Delta=b^2-4ac=${b*b-4*c}>0$，有两实根`,"试用十字相乘：找两数之积="+c+"、之和="+(-b)],
    solution:[`$\\Delta=${b}^2-4\\times${c}=${b*b-4*c}>0$`,`因式分解 $(x${term(-r1,0)})(x${term(-r2,0)})=0$`,`所以 $x_1=${r1},\\ x_2=${r2}$`]};
};

GEN.trig_value=()=>{
  const data=[["\\sin30°","1/2",.5],["\\cos60°","1/2",.5],["\\sin90°","1",1],["\\cos0°","1",1],
    ["\\tan45°","1",1],["\\sin0°","0",0],["\\cos90°","0",0],["\\sin60°","√3/2",.866],["\\cos30°","√3/2",.866]];
  const d=pick(data);
  return{prompt:`求 $${d[0]}$ 的值。`,answer:d[1],type:"text",
    check:i=>{const x=norm(i).replace("√","").replace("sqrt","");return x===norm(d[1]).replace("√","")||numEq((i||"").replace("√3","1.732"),d[2]);},
    hints:["回忆特殊角三角函数表（0/30/45/60/90）","可用单位圆或特殊三角形辅助记忆"],
    solution:[`由特殊角三角函数值表`,`$${d[0]}=${d[1].replace("√3","\\sqrt3")}$`]};
};

GEN.vec_dot=()=>{
  const a=[nz(-4,4),nz(-4,4)],b=[nz(-4,4),nz(-4,4)];const dot=a[0]*b[0]+a[1]*b[1];
  return{prompt:`已知向量 $\\vec a=(${a}),\\ \\vec b=(${b})$，求 $\\vec a\\cdot\\vec b$。`,
    answer:""+dot,type:"number",check:i=>numEq(i,dot),
    hints:["坐标形式：$\\vec a\\cdot\\vec b=x_1x_2+y_1y_2$","即对应分量相乘再相加"],
    solution:[`$\\vec a\\cdot\\vec b=${a[0]}\\times${b[0]}+${a[1]}\\times${b[1]}$`,`$=${a[0]*b[0]}+(${a[1]*b[1]})=${dot}$`]};
};

GEN.arith_seq=()=>{
  const a1=ri(-5,8),d=nz(-4,5),n=ri(5,15);const an=a1+(n-1)*d;
  return{prompt:`等差数列 $\\{a_n\\}$ 中，$a_1=${a1}$，公差 $d=${d}$，求 $a_{${n}}$。`,
    answer:""+an,type:"number",check:i=>numEq(i,an),
    hints:["通项公式 $a_n=a_1+(n-1)d$","代入 $n="+n+"$"],
    solution:[`$a_n=a_1+(n-1)d$`,`$a_{${n}}=${a1}+(${n}-1)\\times${d}$`,`$=${a1}+${(n-1)*d}=${an}$`]};
};

GEN.geo_seq=()=>{
  const a1=nz(-3,4),q=pick([2,3,-2]),n=ri(3,6);const an=a1*Math.pow(q,n-1);
  return{prompt:`等比数列 $\\{a_n\\}$ 中，$a_1=${a1}$，公比 $q=${q}$，求 $a_{${n}}$。`,
    answer:""+an,type:"number",check:i=>numEq(i,an),
    hints:["通项公式 $a_n=a_1\\cdot q^{n-1}$","注意公比的幂次为 n−1"],
    solution:[`$a_n=a_1 q^{n-1}$`,`$a_{${n}}=${a1}\\times${q}^{${n-1}}$`,`$=${a1}\\times${Math.pow(q,n-1)}=${an}$`]};
};

GEN.ineq_quad=()=>{
  const r1=nz(-4,4),r2=nz(-4,4);const lo=Math.min(r1,r2),hi=Math.max(r1,r2);
  const b=-(r1+r2),c=r1*r2;const lt=pick([true,false]);const sign=lt?"<":">";
  const ans=lt?`${lo}<x<${hi}`:`x<${lo} 或 x>${hi}`;
  return{prompt:`解不等式 $x^2${term(b,1)}${term(c,0)}${sign}0$。`,answer:ans,type:"text",
    check:i=>{const m=(i||"").match(/-?\d+/g)||[];const s=m.map(Number);return s.includes(lo)&&s.includes(hi);},
    hints:["先求对应方程的两根 $x_1,x_2$","开口向上口诀：大于取两边，小于取中间"],
    solution:[`方程的根为 $x=${lo},${hi}$`,`二次项系数 >0，开口向上`,lt?`解集为 $(${lo},${hi})$`:`解集为 $(-\\infty,${lo})\\cup(${hi},+\\infty)$`]};
};

GEN.deriv_poly=()=>{
  const a=nz(1,4),b=nz(-4,4),c=ri(-5,5);const p=pick([3,2]);
  const f=`${a}x^{${p}}${term(b,2)}${term(c,1)}`.replace(/^\+/,"");
  const dp=`${a*p}x^{${p-1}}${term(2*b,1)}${term(c,0)}`.replace(/^\+/,"").replace("x^{1}","x");
  return{prompt:`求导：$f(x)=${f}$，求 $f'(x)$。`,answer:dp,type:"text",
    check:i=>norm(i)===norm(dp),
    hints:["幂函数求导法则 $(x^n)'=n\\,x^{n-1}$","逐项求导，常数项导数为 0"],
    solution:[`$(x^n)'=nx^{n-1}$`,`逐项求导`,`$f'(x)=${dp}$`]};
};

GEN.deriv_tangent=()=>{
  const a=nz(1,3),x0=ri(-2,3);
  const k=2*a*x0,y0=a*x0*x0;const bdir=y0-k*x0;
  const eq=`y=${k}x${term(bdir,0)}`;
  return{prompt:`求曲线 $f(x)=${a}x^2$ 在点 $x=${x0}$ 处的切线方程。`,answer:eq,type:"text",
    check:i=>{const m=(i||"").match(/-?\d+/g)||[];return m.map(Number).includes(k)&&(bdir===0||m.map(Number).includes(bdir));},
    hints:["切线斜率 $k=f'(x_0)$，先求导 $f'(x)=2ax$","切点 $(x_0,f(x_0))$，用点斜式 $y-y_0=k(x-x_0)$"],
    solution:[`$f'(x)=${2*a}x$，斜率 $k=f'(${x0})=${k}$`,`切点 $(${x0},${y0})$`,`点斜式整理得 $${eq}$`]};
};

GEN.line_dist=()=>{
  const A=nz(1,4),B=nz(1,4),C=ri(-6,6),px=ri(-4,4),py=ri(-4,4);
  const dist=Math.abs(A*px+B*py+C)/Math.sqrt(A*A+B*B);const dr=Math.round(dist*100)/100;
  return{prompt:`求点 $P(${px},${py})$ 到直线 $${A}x${term(B,1).replace("x","y")}${term(C,0)}=0$ 的距离（保留两位小数）。`,
    answer:""+dr,type:"number",check:i=>Math.abs(parseFloat(i)-dist)<0.02,
    hints:["距离公式 $d=\\dfrac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}$","代入点坐标与直线系数"],
    solution:[`$d=\\dfrac{|${A}\\times${px}+${B}\\times${py}+${C}|}{\\sqrt{${A}^2+${B}^2}}$`,`$=\\dfrac{${Math.abs(A*px+B*py+C)}}{\\sqrt{${A*A+B*B}}}\\approx${dr}$`]};
};

GEN.perm_comb=()=>{
  const n=ri(4,7),r=ri(2,3),isP=pick([true,false]);
  function P(n,r){let x=1;for(let i=0;i<r;i++)x*=(n-i);return x;}
  const val=isP?P(n,r):P(n,r)/P(r,r);
  return{prompt:`计算 $${isP?"A":"C"}_{${n}}^{${r}}$ 的值。`,answer:""+val,type:"number",check:i=>numEq(i,val),
    hints:[isP?"排列 $A_n^r=n(n-1)\\cdots$（$r$ 个连乘）":"组合 $C_n^r=\\dfrac{A_n^r}{r!}$","排列有序、组合无序"],
    solution:[isP?`$A_{${n}}^{${r}}=${Array.from({length:r},(_,i)=>n-i).join("\\times")}=${val}$`:`$C_{${n}}^{${r}}=\\dfrac{${Array.from({length:r},(_,i)=>n-i).join("\\times")}}{${r}!}=${val}$`]};
};

GEN.solid_vol=()=>{
  const shape=pick(["cube","cylinder","cone"]);let prompt,val,sol;
  if(shape==="cube"){const a=ri(2,6);val=a**3;prompt=`棱长为 ${a} 的正方体体积是多少？`;sol=[`$V=a^3=${a}^3=${val}$`];}
  else if(shape==="cylinder"){const r=ri(1,4),h=ri(2,6);val=Math.round(Math.PI*r*r*h*100)/100;prompt=`底面半径 ${r}、高 ${h} 的圆柱体积（保留两位小数）？`;sol=[`$V=\\pi r^2 h=\\pi\\times${r}^2\\times${h}\\approx${val}$`];}
  else{const r=ri(1,4),h=ri(3,6);val=Math.round(Math.PI*r*r*h/3*100)/100;prompt=`底面半径 ${r}、高 ${h} 的圆锥体积（保留两位小数）？`;sol=[`$V=\\dfrac13\\pi r^2 h\\approx${val}$`];}
  return{prompt,answer:""+val,type:"number",check:i=>Math.abs(parseFloat(i)-val)<0.5,
    hints:["回忆该立体的体积公式","圆锥体积 = 同底等高圆柱的 1/3"],solution:sol};
};

GEN.complex_op=()=>{
  const a=nz(-4,4),b=nz(-4,4),c=nz(-4,4),d=nz(-4,4);const op=pick(["+","×"]);
  let re,im;if(op==="+"){re=a+c;im=b+d;}else{re=a*c-b*d;im=a*d+b*c;}
  const cx=(x,y)=>`${x}${y>=0?"+":"-"}${Math.abs(y)}i`;
  const ans=cx(re,im);
  return{prompt:`计算 $(${cx(a,b)})${op==="×"?"\\times":"+"}(${cx(c,d)})$。`,
    answer:ans,type:"text",check:i=>norm(i).replace("i","")===norm(ans).replace("i",""),
    hints:[op==="+"?"实部与实部相加，虚部与虚部相加":"按多项式展开，注意 $i^2=-1$","结果写成 $a+bi$ 形式"],
    solution:[op==="+"?`实部 ${a}+${c}=${re}，虚部 ${b}+${d}=${im}`:`展开并用 $i^2=-1$ 化简`,`结果为 $${ans}$`]};
};

window.GEN=GEN;

// ===== 导数：单调区间 / 极值 =====
GEN.deriv_mono=()=>{
  // f(x)=x^3 - 3a x  (a>0) -> f'=3x^2-3a, 临界点 ±√a；用整数 a=k^2
  const k=ri(1,3);const a=k*k; // 临界点 ±k
  return{prompt:`函数 $f(x)=x^3-${3*a}x$ 的单调递减区间是？`,
    answer:`(${-k},${k})`,type:"text",
    check:i=>{const m=(i||"").match(/-?\d+/g)||[];const s=m.map(Number);return s.includes(-k)&&s.includes(k);},
    hints:["先求导 $f'(x)=3x^2-"+3*a+"$","令 $f'(x)<0$ 解出 x 的范围（递减区间）"],
    solution:[`$f'(x)=3x^2-${3*a}=3(x^2-${a})$`,`令 $f'(x)<0$，即 $x^2<${a}$`,`解得 $-${k}<x<${k}$，递减区间为 $(${-k},${k})$`]};
};

// ===== 向量：坐标线性运算 =====
GEN.vec_coord=()=>{
  const a=[nz(-4,4),nz(-4,4)],b=[nz(-4,4),nz(-4,4)];
  const m=ri(2,3),n=ri(2,3);
  const rx=m*a[0]-n*b[0],ry=m*a[1]-n*b[1];const ans=`(${rx},${ry})`;
  return{prompt:`已知 $\\vec a=(${a}),\\ \\vec b=(${b})$，求 $${m}\\vec a-${n}\\vec b$。`,
    answer:ans,type:"text",
    check:i=>{const m2=(i||"").match(/-?\d+/g)||[];const s=m2.map(Number);return s.length>=2&&s[0]===rx&&s[1]===ry;},
    hints:["向量数乘：每个分量乘以系数","按分量分别计算 x、y，写成 (x,y)"],
    solution:[`$${m}\\vec a=(${m*a[0]},${m*a[1]})$，$${n}\\vec b=(${n*b[0]},${n*b[1]})$`,`相减得 $(${m*a[0]}-${n*b[0]},\\ ${m*a[1]}-${n*b[1]})$`,`$=${ans}$`]};
};

// ===== 椭圆：a,b,c 与离心率 =====
GEN.ellipse=()=>{
  // x^2/A^2 + y^2/B^2 =1, A>B. 用勾股数保证 c 为整数
  const sets=[[5,4,3],[5,3,4],[13,12,5],[13,5,12],[10,8,6],[10,6,8],[25,24,7]];
  let [A,B,c]=pick(sets);if(Math.random()<0.5){const t=A;/* keep A as major */}
  const a=A,b=B;const sub=pick(["c","e"]);
  if(sub==="c"){
    return{prompt:`椭圆 $\\dfrac{x^2}{${a*a}}+\\dfrac{y^2}{${b*b}}=1$ 的焦距 $2c=$ ？`,
      answer:""+(2*c),type:"number",check:i=>numEq(i,2*c),
      hints:["椭圆中 $a^2=b^2+c^2$（$a$ 为长半轴）","先定 $a^2,b^2$，再求 $c=\\sqrt{a^2-b^2}$，焦距为 $2c$"],
      solution:[`$a^2=${a*a},b^2=${b*b}$`,`$c=\\sqrt{${a*a}-${b*b}}=${c}$`,`焦距 $2c=${2*c}$`]};
  }else{
    const e=Math.round(c/a*1000)/1000;
    return{prompt:`椭圆 $\\dfrac{x^2}{${a*a}}+\\dfrac{y^2}{${b*b}}=1$ 的离心率 $e=$ ？（保留三位小数）`,
      answer:""+e,type:"number",check:i=>Math.abs(parseFloat(i)-c/a)<0.01,
      hints:["离心率 $e=\\dfrac{c}{a}$","先求 $c=\\sqrt{a^2-b^2}$，再除以 $a$"],
      solution:[`$a=${a},\\ c=\\sqrt{${a*a}-${b*b}}=${c}$`,`$e=\\dfrac{c}{a}=\\dfrac{${c}}{${a}}\\approx${e}$`]};
  }
};

// ===== 抛物线：焦点 / 准线 =====
GEN.parabola=()=>{
  const p=pick([1,2,3,4]);const form=`y^2=${2*p}x`; // y^2=2px, 焦点(p/2,0), 准线 x=-p/2
  const sub=pick(["focus","dir"]);
  if(sub==="focus"){
    return{prompt:`抛物线 $${form}$ 的焦点坐标是？`,answer:`(${frac(p,2)},0)`,type:"text",
      check:i=>{const m=(i||"").match(/-?\d+(\.\d+)?(\/\d+)?/g)||[];return m.length>=1&&numEq(m[0],p/2);},
      hints:["标准式 $y^2=2px$ 的焦点为 $\\left(\\dfrac{p}{2},0\\right)$",`本题 $2p=${2*p}$，所以 $p=${p}$`],
      solution:[`对比 $y^2=2px$ 得 $2p=${2*p}$，$p=${p}$`,`焦点 $\\left(\\dfrac{p}{2},0\\right)=\\left(${frac(p,2)},0\\right)$`]};
  }else{
    return{prompt:`抛物线 $${form}$ 的准线方程是？`,answer:`x=${frac(-p,2)}`,type:"text",
      check:i=>{const m=(i||"").match(/-?\d+(\.\d+)?(\/\d+)?/g)||[];return m.length>=1&&numEq(m[m.length-1],-p/2);},
      hints:["$y^2=2px$ 的准线为 $x=-\\dfrac{p}{2}$",`先由 $2p=${2*p}$ 求出 $p$`],
      solution:[`$2p=${2*p}\\Rightarrow p=${p}$`,`准线方程 $x=-\\dfrac{p}{2}=${frac(-p,2)}$`]};
  }
};

// ===== 双曲线：渐近线 / 离心率 =====
GEN.hyperbola=()=>{
  const sets=[[3,4,5],[4,3,5],[5,12,13],[12,5,13],[6,8,10],[8,6,10]]; // a,b,c
  const [a,b,c]=pick(sets);const sub=pick(["asym","e"]);
  if(sub==="asym"){
    return{prompt:`双曲线 $\\dfrac{x^2}{${a*a}}-\\dfrac{y^2}{${b*b}}=1$ 的渐近线斜率（正的那条）是？`,
      answer:frac(b,a),type:"text",check:i=>numEq(i,b/a),
      hints:["焦点在 x 轴的双曲线，渐近线为 $y=\\pm\\dfrac{b}{a}x$","正斜率为 $\\dfrac{b}{a}$"],
      solution:[`$a^2=${a*a}\\Rightarrow a=${a}$，$b^2=${b*b}\\Rightarrow b=${b}$`,`渐近线 $y=\\pm\\dfrac{${b}}{${a}}x$，正斜率 $=${frac(b,a)}$`]};
  }else{
    const e=Math.round(c/a*1000)/1000;
    return{prompt:`双曲线 $\\dfrac{x^2}{${a*a}}-\\dfrac{y^2}{${b*b}}=1$ 的离心率 $e=$ ？（保留三位小数）`,
      answer:""+e,type:"number",check:i=>Math.abs(parseFloat(i)-c/a)<0.01,
      hints:["双曲线 $c^2=a^2+b^2$","$e=\\dfrac{c}{a}$"],
      solution:[`$c=\\sqrt{a^2+b^2}=\\sqrt{${a*a}+${b*b}}=${c}$`,`$e=\\dfrac{c}{a}=\\dfrac{${c}}{${a}}\\approx${e}$`]};
  }
};

// ===== 补齐：函数单调性（选择） =====
GEN.func_mono=()=>{
  const a=nz(1,4);const inc=a>0;
  const ch=["在 R 上单调递增","在 R 上单调递减"];
  return{prompt:`一次函数 $f(x)=${a}x+${ri(-5,5)}$ 的单调性是？`,type:"choice",choices:ch,correct:inc?0:1,
    hints:["一次函数 $y=kx+b$ 的单调性只看 $k$ 的符号","$k>0$ 递增，$k<0$ 递减"],
    solution:[`斜率 $k=${a}${inc?">":"<"}0$`,`所以函数${inc?"递增":"递减"}`]};
};
// ===== 对数比较大小（选择） =====
GEN.log_compare=()=>{
  const b=pick([2,3]);const x=ri(2,5),y=ri(6,12);
  const ch=[`\\log_{${b}}${x} < \\log_{${b}}${y}`,`\\log_{${b}}${x} > \\log_{${b}}${y}`];
  return{prompt:`比较 $\\log_{${b}}${x}$ 与 $\\log_{${b}}${y}$ 的大小。`,type:"choice",choices:ch,correct:0,
    hints:[`底数 ${b}>1，对数函数单调递增`,`真数越大，对数值越大；${x}<${y}`],
    solution:[`底数 $${b}>1$，$y=\\log_{${b}}x$ 单调递增`,`因为 $${x}<${y}$`,`所以 $\\log_{${b}}${x}<\\log_{${b}}${y}$`]};
};
// ===== 基本不等式：最小值 =====
GEN.ineq_mean=()=>{
  const k=pick([1,4,9,16]);const min=2*Math.sqrt(k);
  return{prompt:`已知 $x>0$，求 $x+\\dfrac{${k}}{x}$ 的最小值。`,answer:""+min,type:"number",check:i=>numEq(i,min),
    hints:["基本不等式 $a+b\\ge2\\sqrt{ab}$（$a,b>0$）",`这里 $a=x,\\ b=\\dfrac{${k}}{x}$，$ab=${k}$ 为定值`],
    solution:[`$x+\\dfrac{${k}}{x}\\ge 2\\sqrt{x\\cdot\\dfrac{${k}}{x}}=2\\sqrt{${k}}$`,`当 $x=\\sqrt{${k}}$ 时取等`,`最小值为 $${min}$`]};
};
// ===== 数列求和：等差前n项和 =====
GEN.seq_sum=()=>{
  const a1=ri(1,6),d=ri(1,5),n=ri(5,12);const Sn=n*a1+n*(n-1)/2*d;
  return{prompt:`等差数列 $a_1=${a1},\\ d=${d}$，求前 ${n} 项和 $S_{${n}}$。`,answer:""+Sn,type:"number",check:i=>numEq(i,Sn),
    hints:["$S_n=na_1+\\dfrac{n(n-1)}{2}d$","或 $S_n=\\dfrac{n(a_1+a_n)}{2}$"],
    solution:[`$S_n=na_1+\\dfrac{n(n-1)}{2}d$`,`$=${n}\\times${a1}+\\dfrac{${n}\\times${n-1}}{2}\\times${d}$`,`$=${n*a1}+${n*(n-1)/2*d}=${Sn}$`]};
};
// ===== 圆的方程：圆心半径 =====
GEN.circle_eq=()=>{
  const a=ri(-4,4),b=ri(-4,4),r=ri(2,6);const sub=pick(["center","r"]);
  if(sub==="center"){
    return{prompt:`圆 $(x${term(-a,0)})^2+(y${term(-b,0)})^2=${r*r}$ 的圆心坐标是？`,answer:`(${a},${b})`,type:"text",
      check:i=>{const m=(i||"").match(/-?\d+/g)||[];const s=m.map(Number);return s.length>=2&&s[0]===a&&s[1]===b;},
      hints:["标准式 $(x-a)^2+(y-b)^2=r^2$ 的圆心为 $(a,b)$","注意括号内符号要取相反数"],
      solution:[`对比标准式 $(x-a)^2+(y-b)^2=r^2$`,`得圆心 $(${a},${b})$`]};
  }else{
    return{prompt:`圆 $(x${term(-a,0)})^2+(y${term(-b,0)})^2=${r*r}$ 的半径是？`,answer:""+r,type:"number",check:i=>numEq(i,r),
      hints:["标准式右边等于 $r^2$","开平方得半径"],
      solution:[`$r^2=${r*r}$`,`$r=\\sqrt{${r*r}}=${r}$`]};
  }
};
// ===== 古典概型 =====
GEN.prob_basic=()=>{
  const sc=pick([
    ()=>{const n=ri(2,4);return{q:`一个袋子里有 ${n} 个红球和 ${6-n} 个白球，随机摸一个，摸到红球的概率是？`,p:n/6,sol:[`总数 6，红球 ${n}`,`$P=\\dfrac{${n}}{6}=${frac(n,6)}$`]};},
    ()=>{return{q:`掷一枚均匀骰子，点数大于 4 的概率是？`,p:2/6,sol:["点数>4 即 5、6，共 2 种","$P=\\dfrac{2}{6}=\\dfrac13$"]};},
    ()=>{return{q:`掷一枚均匀骰子，出现偶数的概率是？`,p:3/6,sol:["偶数为 2、4、6，共 3 种","$P=\\dfrac{3}{6}=\\dfrac12$"]};},
  ]);const o=sc();const e=Math.round(o.p*1000)/1000;
  return{prompt:o.q,answer:frac(Math.round(o.p*6),6),type:"text",
    check:i=>{const v=(i||"").includes("/")?(()=>{const[p,q]=i.split("/");return p/q})():parseFloat(i);return Math.abs(v-o.p)<0.02;},
    hints:["古典概型 $P=\\dfrac{有利结果数}{总结果数}$","先数清楚分母（总数）和分子（满足条件数）"],solution:o.sol};
};
// ===== 三角恒等：同角关系 =====
GEN.trig_id=()=>{
  const data=[["3/5","4/5"],["4/5","3/5"],["5/13","12/13"],["12/13","5/13"],["8/17","15/17"]];
  const d=pick(data);const sinv=eval(d[0]),cosv=eval(d[1]);
  return{prompt:`已知 $\\sin\\theta=\\dfrac{${d[0].replace("/","}{")}}$ 且 $\\theta$ 为锐角，求 $\\cos\\theta$。`,
    answer:d[1],type:"text",check:i=>{const v=(i||"").includes("/")?(()=>{const[p,q]=i.split("/");return p/q})():parseFloat(i);return Math.abs(v-cosv)<0.02;},
    hints:["同角三角函数关系 $\\sin^2\\theta+\\cos^2\\theta=1$","锐角时 $\\cos\\theta>0，取正根"],
    solution:[`$\\cos^2\\theta=1-\\sin^2\\theta=1-\\left(\\dfrac{${d[0].replace("/","}{")}}\\right)^2$`,`$\\theta$ 为锐角，$\\cos\\theta>0$`,`$\\cos\\theta=\\dfrac{${d[1].replace("/","}{")}}$`]};
};
