// app.js
(async function(){
  const state = {
    subjectKey: "iraq_biology_grade12",
    filter: "all",
    search: "",
    page: 1,
    perPage: 10,
    data: [],
    results: { correct:0, wrong:0 }
  };

  // عناصر
  const subjectSelect = document.getElementById("subjectSelect");
  const searchInput = document.getElementById("searchInput");
  const questionsList = document.getElementById("questionsList");
  const countLabel = document.getElementById("countLabel");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const correctCount = document.getElementById("correctCount");
  const wrongCount = document.getElementById("wrongCount");
  const mastery = document.getElementById("mastery");
  const exportReport = document.getElementById("exportReport");
  const generateAI = document.getElementById("generateAI");
  const aiTopic = document.getElementById("aiTopic");
  const aiType = document.getElementById("aiType");
  const aiResult = document.getElementById("aiResult");
  const startMock = document.getElementById("startMock");

  // تحميل بيانات وزارية محلية (JSON)
  async function loadSubject(key){
    const res = await fetch(`data/${key}.json`);
    const json = await res.json();
    state.data = json.questions || [];
    state.page = 1;
    render();
  }

  // تصفية وبحث
  function filtered(){
    const q = state.search.trim().toLowerCase();
    return state.data.filter(item=>{
      const typeOk = state.filter==="all" ? true : item.type===state.filter;
      const searchOk = !q ? true : (item.title.toLowerCase().includes(q) || (item.desc||"").toLowerCase().includes(q));
      return typeOk && searchOk;
    });
  }

  // عرض الأسئلة
  function render(){
    const data = filtered();
    countLabel.textContent = data.length;
    const start = (state.page-1)*state.perPage;
    const pageItems = data.slice(start, start+state.perPage);

    questionsList.innerHTML = "";
    pageItems.forEach((item,idx)=>{
      questionsList.appendChild(renderQuestion(item, start+idx+1));
    });

    pageInfo.textContent = `صفحة ${state.page}`;
    correctCount.textContent = state.results.correct;
    wrongCount.textContent = state.results.wrong;
    const total = state.results.correct + state.results.wrong;
    mastery.textContent = total ? Math.round((state.results.correct/total)*100)+"%" : "0%";
  }

  function renderQuestion(item, index){
    const el = document.createElement("div");
    el.className = "question";

    const ix = document.createElement("div");
    ix.className = "q-index"; ix.textContent = index;

    const body = document.createElement("div");
    body.className = "q-body";
    const title = document.createElement("div");
    title.className = "q-title"; title.textContent = item.title;
    const desc = document.createElement("div");
    desc.className = "q-desc"; desc.textContent = item.desc||"";
    const tags = document.createElement("div");
    tags.className = "q-tags";
    const tagType = document.createElement("span");
    tagType.className = "tag"; tagType.textContent = item.type==="mcq"?"اختيار من متعدد":"قصير";
    tags.appendChild(tagType);
    (item.tags||[]).forEach(t=>{const s=document.createElement("span");s.className="tag";s.textContent=t;tags.appendChild(s);});
    body.appendChild(title); body.appendChild(desc); body.appendChild(tags);

    const right = document.createElement("div");
    right.style.display="flex"; right.style.flexDirection="column"; right.style.gap="10px";
    const score = document.createElement("div");
    score.className="score"; score.textContent="—";
    right.appendChild(score);

    if(item.type==="mcq"){
      const answersBox = document.createElement("div");
      answersBox.className="q-answers";
      item.options.forEach((opt,i)=>{
        const row = document.createElement("label"); row.className="answer";
        const radio = document.createElement("input"); radio.type="radio"; radio.name=`q_${item.id}`;
        const span = document.createElement("span"); span.textContent = opt.text;
        radio.addEventListener("change",()=>{
          const correct = !!opt.correct;
          score.textContent = correct?"صحيح":"خطأ";
          if(correct){ state.results.correct++; }else{ state.results.wrong++; }
          render();
        });
        row.appendChild(radio); row.appendChild(span);
        answersBox.appendChild(row);
      });
      body.appendChild(answersBox);
    }else{
      const input = document.createElement("input"); input.placeholder="اكتب إجابتك هنا";
      const checkBtn = document.createElement("button"); checkBtn.className="btn"; checkBtn.textContent="تحقق";
      checkBtn.addEventListener("click",()=>{
        const user = (input.value||"").trim().toLowerCase();
        const key = (item.answer||"").trim().toLowerCase();
        const ok = user && key && (similar(user,key)>0.6 || user===key);
        score.textContent = ok?"صحيح":"خطأ";
        if(ok){ state.results.correct++; }else{ state.results.wrong++; }
        render();
      });
      body.appendChild(input);
      const controls = document.createElement("div"); controls.className="q-controls";
      controls.appendChild(checkBtn);
      body.appendChild(controls);
    }

    el.appendChild(ix); el.appendChild(body); el.appendChild(right);
    return el;
  }

  // تشابه بسيط للنصوص (بديل مؤقت)
  function similar(a,b){
    const setA = new Set(a.split(/\s+/)); const setB = new Set(b.split(/\s+/));
    const inter = [...setA].filter(x=>setB.has(x)).length;
    const denom = Math.max(setA.size,setB.size)||1;
    return inter/denom;
  }

  // أحداث
  subjectSelect.addEventListener("change",(e)=>{ state.subjectKey=e.target.value; loadSubject(state.subjectKey); });
  searchInput.addEventListener("input",(e)=>{ state.search=e.target.value; state.page=1; render(); });
  document.getElementsByName("filter").forEach(r=>r.addEventListener("change",(e)=>{ state.filter=e.target.value; state.page=1; render(); }));
  prevPage.addEventListener("click",()=>{ if(state.page>1){ state.page--; render(); }});
  nextPage.addEventListener("click",()=>{
    const max = Math.ceil(filtered().length/state.perPage);
    if(state.page<max){ state.page++; render(); }
  });
  exportReport.addEventListener("click",()=>{
    const blob = new Blob([JSON.stringify(state.results,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download="report.json"; a.click(); URL.revokeObjectURL(a.href);
  });

  // توليد سؤال بالذكاء الاصطناعي عبر وظيفة سحابية
  generateAI.addEventListener("click", async()=>{
    const payload = { topic: aiTopic.value.trim(), type: aiType.value };
    if(!payload.topic){ aiResult.classList.remove("hidden"); aiResult.textContent="اكتب موضوعاً أولاً"; return; }
    aiResult.classList.remove("hidden"); aiResult.textContent="...جارٍ التوليد";
    try{
      const res = await fetch("/api/generate-question",{
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      const out = await res.json();
      aiResult.innerHTML = renderAI(out);
    }catch(err){
      aiResult.textContent = "تعذر التوليد حالياً — تأكد من نشر الوظيفة السحابية."
    }
  });

  startMock.addEventListener("click",()=>{
    state.page = 1; state.perPage = 5; render();
  });

  function renderAI(o){
    const opts = (o.options||[]).map((x,i)=>`<div>• ${x.text}${x.correct?" (صحيح)":""}</div>`).join("");
    return `
      <div><strong>سؤال مولّد:</strong> ${o.title}</div>
      ${o.desc?`<div style="color:#b8c2cf">${o.desc}</div>`:""}
      ${opts?`<div style="margin-top:6px">${opts}</div>`:""}
      ${o.explanation?`<div style="margin-top:8px">التفسير: ${o.explanation}</div>`:""}
      ${o.source?`<div style="margin-top:8px;color:#b8c2cf">المصدر: ${o.source}</div>`:""}
    `;
  }

  // بدء
  await loadSubject(state.subjectKey);
})();
