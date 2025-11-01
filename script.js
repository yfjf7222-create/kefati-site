(function () {
  const state = {
    pointsCurrent: 0,
    percent: 0,
    goalPercent: 80,
    answered: 0,
    left: 129,
    page: 1,
    perPage: 10,
    filter: "all",
    search: "",
    questions: [],
  };

  // نماذج بيانات أسئلة — مقتبسة بالأسلوب فقط، مع نصوص عربية مناسبة
  const seedQuestions = [
    {
      id: 1,
      title: "ما أهمية كل مما يأتي: الزراعة النسيجية، الجسيمات الحالة، النسيج الأساس، نظرية دارون، الفجوات المتقلصة",
      desc: "أجب عن أربعة فقط. الزراعة النسيجية: إكثار النباتات وتحسينها، الجسيمات الحالة: الهضم داخل الخلية...",
      points: 0,
      status: "unanswered",
      tags: ["نشاط", "تعريفات", "أحياء"],
    },
    {
      id: 2,
      title: "ما التغيرات التي تحدث في الدور الحرَكي؟",
      desc: "تزداد الكروموسومات قصرًا وتغلّظًا، يبدأ الغشاء النووي بالانحلال...",
      points: 0,
      status: "unanswered",
      tags: ["خلية", "انقسام"],
    },
    {
      id: 7,
      title: "وراثة: تزاوج خنزير غينيا أسود خشن مع أنثى سوداء خشنة وظهور أبيض ناعم",
      desc: "الاستنتاج: كلا الأبوين هجينيان (BbRr × BbRr)، النسب 9:3:3:1...",
      points: 0,
      status: "unanswered",
      tags: ["وراثة", "احتمالات"],
    },
    {
      id: 18,
      title: "وراثة: رمادي طويل × رمادية أثرية وظهور أفراد سوداء طويلة",
      desc: "الأبوان هجينيان (Gg)، والطول (Ll). مخرجات متعددة...",
      points: 0,
      status: "unanswered",
      tags: ["وراثة"],
    },
    {
      id: 21,
      title: "في أي دور يحدث: خيوط المغزل، الصفيحة الخلوية، اختفاء الغشاء النووي، الرباعيات، التعابر",
      desc: "التمهيدي/النهائي/التغلظي حسب الحالة...",
      points: 0,
      status: "unanswered",
      tags: ["خلية", "أدوار"],
    },
    {
      id: 33,
      title: "اشرح تكوين الأريمة في الرميح",
      desc: "تركيب كروي بطبقة واحدة تحيط بجوف أروْمي يظهر مبكرًا...",
      points: 0,
      status: "unanswered",
      tags: ["جنينيات"],
    },
    {
      id: 39,
      title: "اذكر مميزات البلازميد",
      desc: "يحمل جينات قليلة، يتضاعف ذاتيًا، قابل للنقل بين البكتريا...",
      points: 0,
      status: "unanswered",
      tags: ["بكتريا", "جزيئات"],
    },
    {
      id: 47,
      title: "خطوات الزراعة النسيجية للنخيل",
      desc: "استخلاص القمة النامية وتعقيم وزراعة في أوساط غذائية...",
      points: 0,
      status: "unanswered",
      tags: ["نبات", "تقنيات"],
    },
    {
      id: 56,
      title: "نظريات تفسير حركة الكروموسومات نحو القطبين",
      desc: "تقلص خيوط المغزل بوجود ATP أو الانزلاق...",
      points: 0,
      status: "unanswered",
      tags: ["خلية", "فيزياء حيوية"],
    },
    {
      id: 60,
      title: "أهمية: الزراعة النسيجية، الجسيمات الحالة، النسيج الأساس، نظرية دارون، الفجوات",
      desc: "أجب عن أربعة. نقاط موجزة لكل مفهوم...",
      points: 0,
      status: "unanswered",
      tags: ["مفاهيم"],
    },
  ];

  // تكثير بسيط ليصبح العدد 129 عن طريق تدوير البذور
  function buildDataset() {
    const out = [];
    let idCounter = 1;
    while (out.length < 129) {
      const base = seedQuestions[(out.length) % seedQuestions.length];
      out.push({
        id: idCounter++,
        title: base.title,
        desc: base.desc,
        points: 0,
        status: "unanswered",
        tags: base.tags,
      });
    }
    return out;
  }

  // تهيئة
  function init() {
    state.questions = buildDataset();
    computeSummary();
    renderSummary();
    renderQuestions();
    bindEvents();
  }

  function computeSummary() {
    const total = state.questions.length;
    const answered = state.questions.filter(q => q.status !== "unanswered").length;
    const points = state.questions.reduce((s, q) => s + (q.points || 0), 0);
    state.answered = answered;
    state.left = total - answered;
    state.pointsCurrent = points;
    state.percent = total ? Math.round((answered / total) * 100) : 0;
  }

  function renderSummary() {
    setText("percent", state.percent + "%");
    setText("pointsCurrent", state.pointsCurrent);
    setText("pointsGoal", state.goalPercent + "%");
    setText("answered", state.answered);
    setText("left", state.left);
    setText("questionsCount", state.questions.length);
    setText("pageInfo", `صفحة ${state.page}`);
  }

  function filteredQuestions() {
    const q = state.search.trim().toLowerCase();
    return state.questions.filter(item => {
      const statusOk =
        state.filter === "all" ? true : item.status === state.filter;
      const searchOk =
        q.length === 0
          ? true
          : (item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
      return statusOk && searchOk;
    });
  }

  function renderQuestions() {
    const root = document.getElementById("questionsList");
    root.innerHTML = "";
    const data = filteredQuestions();
    const start = (state.page - 1) * state.perPage;
    const pageItems = data.slice(start, start + state.perPage);

    pageItems.forEach(item => {
      root.appendChild(questionNode(item));
    });
  }

  function questionNode(item) {
    const el = document.createElement("div");
    el.className = "question";

    const index = document.createElement("div");
    index.className = "q-index";
    index.textContent = item.id;

    const body = document.createElement("div");
    body.className = "q-body";

    const title = document.createElement("div");
    title.className = "q-title";
    title.textContent = item.title;

    const desc = document.createElement("div");
    desc.className = "q-desc";
    desc.textContent = item.desc;

    const tags = document.createElement("div");
    tags.className = "q-tags";
    const tagStatus = document.createElement("span");
    tagStatus.className = `tag status-${item.status}`;
    tagStatus.textContent =
      item.status === "unanswered" ? "لم تُجب" :
      item.status === "correct" ? "إجابة صحيحة" :
      "إجابة خاطئة";
    tags.appendChild(tagStatus);
    (item.tags || []).forEach(t => {
      const s = document.createElement("span");
      s.className = "tag";
      s.textContent = t;
      tags.appendChild(s);
    });

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(tags);

    const scoreBox = document.createElement("div");
    scoreBox.className = "q-score";

    const score = document.createElement("div");
    score.className = "score neutral";
    score.textContent = `${item.points}/100`;
    scoreBox.appendChild(score);

    const btns = document.createElement("div");
    btns.style.display = "flex";
    btns.style.gap = "8px";

    const markCorrect = button("صح", "accent");
    markCorrect.addEventListener("click", () => {
      item.status = "correct";
      item.points = 100;
      score.className = "score good";
      score.textContent = "100/100";
      renderSummary();
      renderQuestions();
    });

    const markWrong = button("خطأ", "danger");
    markWrong.addEventListener("click", () => {
      item.status = "wrong";
      item.points = 0;
      score.className = "score bad";
      score.textContent = "0/100";
      renderSummary();
      renderQuestions();
    });

    const markSkip = button("تَرك", "muted");
    markSkip.addEventListener("click", () => {
      item.status = "unanswered";
      item.points = 0;
      score.className = "score neutral";
      score.textContent = "0/100";
      renderSummary();
      renderQuestions();
    });

    btns.appendChild(markCorrect);
    btns.appendChild(markWrong);
    btns.appendChild(markSkip);

    scoreBox.appendChild(btns);

    el.appendChild(index);
    el.appendChild(body);
    el.appendChild(scoreBox);

    return el;
  }

  function button(text, kind = "primary") {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = text;
    if (kind === "accent") {
      b.style.background = "var(--accent)";
      b.style.color = "#021524";
      b.style.borderColor = "transparent";
    } else if (kind === "danger") {
      b.style.background = "var(--danger)";
      b.style.color = "#fff";
      b.style.borderColor = "transparent";
    } else if (kind === "muted") {
      b.style.background = "var(--bg-soft)";
      b.style.color = "var(--muted)";
    }
    return b;
  }

  function bindEvents() {
    document.getElementsByName("status").forEach(radio => {
      radio.addEventListener("change", (e) => {
        state.filter = e.target.value;
        state.page = 1;
        renderSummary();
        renderQuestions();
      });
    });

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      state.page = 1;
      renderSummary();
      renderQuestions();
    });

    document.getElementById("prevPage").addEventListener("click", () => {
      if (state.page > 1) {
        state.page--;
        renderSummary();
        renderQuestions();
      }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
      const totalFiltered = filteredQuestions().length;
      const maxPage = Math.ceil(totalFiltered / state.perPage);
      if (state.page < maxPage) {
        state.page++;
        renderSummary();
        renderQuestions();
      }
    });

    document.getElementById("toggleTheme").addEventListener("click", toggleTheme);

    document.getElementById("exportBtn").addEventListener("click", exportJSON);
  }

  function toggleTheme() {
    const isLight = document.body.dataset.theme === "light";
    document.body.dataset.theme = isLight ? "dark" : "light";
    if (!isLight) {
      // Light
      document.documentElement.style.setProperty("--bg", "#f7f9fc");
      document.documentElement.style.setProperty("--bg-soft", "#ffffff");
      document.documentElement.style.setProperty("--text", "#0f1216");
      document.documentElement.style.setProperty("--muted", "#4c596a");
      document.documentElement.style.setProperty("--border", "#e8edf3");
      document.documentElement.style.setProperty("--chip", "#f0f4f9");
      document.documentElement.style.setProperty("--shadow", "0 6px 24px rgba(0,0,0,0.06)");
    } else {
      // Dark
      document.documentElement.style.setProperty("--bg", "#0f1216");
      document.documentElement.style.setProperty("--bg-soft", "#171b21");
      document.documentElement.style.setProperty("--text", "#e9eef6");
      document.documentElement.style.setProperty("--muted", "#b8c2cf");
      document.documentElement.style.setProperty("--border", "#242a33");
      document.documentElement.style.setProperty("--chip", "#202631");
      document.documentElement.style.setProperty("--shadow", "0 6px 24px rgba(0,0,0,0.25)");
    }
  }

  function exportJSON() {
    const payload = {
      meta: {
        percent: state.percent,
        pointsCurrent: state.pointsCurrent,
        answered: state.answered,
        left: state.left,
        goalPercent: state.goalPercent,
      },
      filters: {
        status: state.filter,
        search: state.search,
        page: state.page,
        perPage: state.perPage,
      },
      questions: state.questions.map(q => ({
        id: q.id, status: q.status, points: q.points
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "exam-results.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // انطلاق
  init();
})();
