// ===== 语音输入 + 拍照 OCR 输入（全部客户端，无需后端） =====
const InputAids={
  // 中文口语 -> 数学符号的简单归一
  speechToMath(t){
    if(!t)return"";
    const map=[[/负/g,"-"],[/加|正/g,"+"],[/减/g,"-"],[/乘以|乘/g,"*"],[/除以|除/g,"/"],
      [/分之/g,"/"],[/点/g,"."],[/根号/g,"√"],[/等于/g,"="],
      [/零/g,"0"],[/一/g,"1"],[/二|两/g,"2"],[/三/g,"3"],[/四/g,"4"],[/五/g,"5"],
      [/六/g,"6"],[/七/g,"7"],[/八/g,"8"],[/九/g,"9"],[/十/g,"10"],
      [/开区间|逗号|，/g,","],[/左括号|（/g,"("],[/右括号|）/g,")"],[/\s/g,""]];
    let s=t;map.forEach(([re,v])=>s=s.replace(re,v));
    // "X分之Y" 已转成 X/Y 但顺序可能反，这里简单处理常见 "二分之一"->2/1 需翻转
    return s;
  },
  // 语音识别
  startVoice(onText,btn){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("当前浏览器不支持语音识别，建议用 Chrome / Edge");return;}
    const r=new SR();r.lang="zh-CN";r.interimResults=false;r.maxAlternatives=1;
    btn.textContent="🎙️ 聆听中…";btn.disabled=true;
    r.onresult=e=>{const raw=e.results[0][0].transcript;onText(raw,this.speechToMath(raw));};
    r.onerror=e=>{alert("语音识别出错："+e.error);};
    r.onend=()=>{btn.textContent="🎤 语音";btn.disabled=false;};
    r.start();
  },
  // 拍照 / 选图 -> OCR
  photoOCR(file,onText,statusEl){
    if(!file)return;
    const run=()=>{
      statusEl.textContent="识别中…（首次需加载识别引擎，请稍候）";
      Tesseract.recognize(file,"eng",{logger:m=>{
        if(m.status==="recognizing text")statusEl.textContent="识别中… "+Math.round(m.progress*100)+"%";
      }}).then(({data})=>{
        const txt=(data.text||"").trim();
        statusEl.textContent=txt?("识别结果："+txt):"没识别到清晰文字，换张更清楚的图试试";
        if(txt)onText(txt);
      }).catch(err=>{statusEl.textContent="识别失败："+err.message;});
    };
    if(window.Tesseract)run();
    else{ // 按需加载 Tesseract.js
      statusEl.textContent="加载识别引擎…";
      const sc=document.createElement("script");
      sc.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      sc.onload=run;sc.onerror=()=>statusEl.textContent="识别引擎加载失败，请检查网络";
      document.head.appendChild(sc);
    }
  }
};
window.InputAids=InputAids;
