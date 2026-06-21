// ===== 交互式函数图像 (Canvas) =====
const Viz={
  // 在 canvas 上画坐标系 + 函数曲线 fn(x)->y
  plot(cv,fn,opt={}){
    const dpr=window.devicePixelRatio||1;
    const W=cv.clientWidth,H=opt.h||260;
    cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+"px";
    const ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);
    const xr=opt.xr||10,yr=opt.yr||10; // 显示范围 [-xr,xr]
    const ox=W/2,oy=H/2,sx=W/(2*xr),sy=H/(2*yr);
    const X=x=>ox+x*sx, Y=y=>oy-y*sy;
    // 网格
    ctx.strokeStyle="#1f2430";ctx.lineWidth=1;ctx.beginPath();
    for(let x=-xr;x<=xr;x++){ctx.moveTo(X(x),0);ctx.lineTo(X(x),H);}
    for(let y=-yr;y<=yr;y++){ctx.moveTo(0,Y(y));ctx.lineTo(W,Y(y));}
    ctx.stroke();
    // 轴
    ctx.strokeStyle="#4a5266";ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();
    // 曲线
    ctx.strokeStyle=opt.color||"#6c8cff";ctx.lineWidth=2.5;ctx.beginPath();
    let started=false;
    for(let px=0;px<=W;px+=1){
      const x=(px-ox)/sx;const y=fn(x);
      if(!isFinite(y)){started=false;continue;}
      const py=Y(y);
      if(py<-50||py>H+50){started=false;continue;}
      if(!started){ctx.moveTo(px,py);started=true;}else ctx.lineTo(px,py);
    }
    ctx.stroke();
    // 标记点
    if(opt.mark){ctx.fillStyle=opt.markColor||"#22d3a6";
      opt.mark.forEach(p=>{ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),5,0,7);ctx.fill();});}
  }
};
window.Viz=Viz;
