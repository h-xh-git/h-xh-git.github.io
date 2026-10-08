/* ============================================================
   projects-page.js — 「项目」栏目页：时间线
   项目数据全部来自 assets/data/projects.js，本文件只负责排版。

   排布规则（2026-10-09 由两列网格改成时间线，细节见 page.css 第 10 节）：
     · 一行一个项目：左边日期、中间一条带节点的时间轴、右边卡片
     · 卡片内容：序号 →（窄屏另有一枚日期）→ 封面（在右）→ 标题 → 摘要 → 日期 · 状态胶囊
     · 填了 link 的卡片右上角压一枚圆形箭头（绝对定位，见 CSS）
     · 没有封面时用占位块：淡序号水印 + 居中标题 + 右上角 ✳
     · 排序：有 date 的按 date 倒序在前，没 date 的排在后面（数组顺序）
   页面根元素上的 data-base 用来把数据里的站内路径补成当前页能用的相对路径。
   ============================================================ */
(function () {
  var root = document.querySelector("[data-projects]");
  if (!root) return;

  var base = root.getAttribute("data-base") || "";
  var list = root.querySelector("[data-project-list]");
  if (!list) return;

  var projects = (window.PROJECTS || [])
    .filter(function (p) {
      return p && p.title;
    })
    .sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M7 17 17 7M9 7h8v8"/></svg>';

  /* ---------- 小工具 ---------- */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* 只用来把本地固定常量变成元素，不接收外部内容 */
  function mark(markup) {
    var wrap = document.createElement("span");
    wrap.innerHTML = markup;
    return wrap.firstElementChild;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  /* 2026-09-18 → 2026.09 */
  function monthOf(value) {
    return typeof value === "string" && value.length >= 7 ? value.slice(0, 7).replace("-", ".") : "";
  }

  /* 时间轴上的日期：period（写死的区间，如 2026.07–08）优先；
     有具体日子显示到天，只有月份就显示到月；都没有返回空串（调用处补「日期待补」）。 */
  function dateLabel(project) {
    if (project.period) return project.period;
    var value = String(project.date || "");
    if (value.length >= 10) return value.slice(0, 10).replace(/-/g, ".");
    if (value.length >= 7) return value.slice(0, 7).replace("-", ".");
    return "";
  }

  /* ---------- 封面 / 占位块 ---------- */
  function coverOf(project, index) {
    if (project.cover) {
      var img = el("img");
      img.src = base + project.cover;
      img.alt = project.title;
      img.loading = "lazy";
      img.decoding = "async";
      return img;
    }

    /* 没封面：淡序号水印 + 居中标题，比一块空灰块像样 */
    var fallback = el("span", "project-fallback");
    fallback.appendChild(el("em", "project-fallback-no", pad(index + 1)));
    fallback.appendChild(el("strong", null, project.title));
    fallback.appendChild(el("i", null, "✳"));
    return fallback;
  }

  /* ---------- 一张卡 ---------- */
  function buildItem(project, index) {
    var li = el("li", "project-item");

    /* 时间轴左侧的日期（窄屏由 CSS 收起，卡片顶部的 .project-date 顶上） */
    li.appendChild(el("span", "project-when", dateLabel(project) || "日期待补"));

    var card = project.link ? el("a", "project-card") : el("div", "project-card");
    if (project.link) {
      card.href = project.link;
      card.target = "_blank";
      card.rel = "noopener";
    }

    var top = el("div", "project-top");
    top.appendChild(el("span", "project-no", pad(index + 1)));
    /* 这枚日期只在窄屏显示（桌面端日期在左侧轴上） */
    top.appendChild(el("span", "project-date", dateLabel(project) || "日期待补"));

    if (project.link) {
      var arrow = el("span", "project-arrow");
      arrow.setAttribute("aria-hidden", "true");
      arrow.appendChild(mark(ARROW));
      top.appendChild(arrow);
    }
    card.appendChild(top);

    var cover = el("div", "project-cover");
    cover.appendChild(coverOf(project, index));
    card.appendChild(cover);

    var body = el("div", "project-body");
    body.appendChild(el("h3", "project-name", project.title));
    if (project.summary) body.appendChild(el("p", "project-desc", project.summary));

    var when = project.period || monthOf(project.date);
    if (when || project.status) {
      var meta = el("span", "project-meta");
      if (when) meta.appendChild(el("span", "project-meta-when", when));
      if (project.status) meta.appendChild(el("span", "project-status", project.status));
      body.appendChild(meta);
    }

    card.appendChild(body);
    li.appendChild(card);
    return li;
  }

  /* ---------- 计数 / 空状态 / 初始化 ---------- */
  function renderCount() {
    var box = root.querySelector("[data-project-count]");
    if (box) box.textContent = projects.length ? "共 " + projects.length + " 个项目" : "";

    var chip = root.querySelector("[data-project-chip]");
    if (chip) {
      chip.hidden = !projects.some(function (p) {
        return p.demo;
      });
    }
  }

  function renderEmpty() {
    var empty = root.querySelector("[data-project-empty]");
    if (empty) empty.hidden = projects.length > 0;
    list.hidden = projects.length === 0;
  }

  list.textContent = "";

  if (projects.length) {
    list.className = "project-list";

    projects.forEach(function (project, index) {
      list.appendChild(buildItem(project, index));
    });
  }

  renderCount();
  renderEmpty();
})();
