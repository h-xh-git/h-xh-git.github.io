/* ============================================================
   essays-page.js — 「随笔」的渲染
   一个文件管三处，各自认自己的容器，页面上没有对应容器就跳过：
     ① 首页「最近写下的」卡 → [data-essay-card]
     ② 随笔目录页           → [data-essay-list]
     ③ 单篇阅读页           → [data-essay-reader]（地址 essays/read.html?p=slug）
   数据全部来自 assets/data/essays.js。
   图片这类站内路径用根元素上的 data-base 补相对路径（首页 ""，子目录页 "../"）。
   ============================================================ */
(function () {
  var SOURCE = (window.ESSAYS || []).filter(function (e) {
    return e && e.slug && e.title;
  });

  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M7 17 17 7M9 7h8v8"/></svg>';

  var ARROW_LEFT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>';

  /* ---------- 小工具 ---------- */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /* 只把本地固定常量变成元素 */
  function mark(markup) {
    var wrap = document.createElement("span");
    wrap.innerHTML = markup;
    return wrap.firstElementChild;
  }

  function baseOf(node) {
    return (node && node.getAttribute("data-base")) || "";
  }

  function dots(value) {
    return typeof value === "string" ? value.replace(/-/g, ".") : "";
  }

  function newestFirst() {
    return SOURCE.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  function url(slug) {
    return "read.html?p=" + encodeURIComponent(slug);
  }

  function anyDemo(list) {
    return (list || SOURCE).some(function (e) {
      return e.demo;
    });
  }

  /* 正文：字符串 = 一段；{h:…} = 小标题；{quote:…} = 引用 */
  function renderBody(container, body) {
    (body || []).forEach(function (part) {
      if (typeof part === "string") {
        if (part.trim()) container.appendChild(el("p", null, part));
        return;
      }
      if (!part) return;
      if (part.h) container.appendChild(el("h2", null, part.h));
      if (part.quote) container.appendChild(el("blockquote", null, part.quote));
    });
  }

  /* ============================================================
     ① 首页「最近写下的」卡
     ============================================================ */
  function initCard() {
    var card = document.querySelector("[data-essay-card]");
    if (!card) return;

    var list = card.querySelector(".home-articles");
    var chip = card.querySelector(".demo-chip");
    if (!list) return;

    var base = baseOf(card);
    /* 卡里固定三行等分铺满，多于三篇只取最近三篇 */
    var items = newestFirst().slice(0, 3);

    list.textContent = "";

    if (items.length) {
      items.forEach(function (essay) {
        var row = el("a", "home-article" + (essay.image ? "" : " text-only"));
        row.href = "essays/" + url(essay.slug);

        if (essay.image) {
          var img = el("img");
          img.src = base + essay.image;
          img.alt = "";
          img.loading = "lazy";
          row.appendChild(img);
        }

        var text = el("span");
        text.appendChild(el("strong", null, essay.title));
        if (essay.excerpt) text.appendChild(el("span", "article-excerpt", essay.excerpt));
        row.appendChild(text);

        list.appendChild(row);
      });
    } else {
      list.appendChild(el("p", "empty-note", "还没写东西 —— 数据在 assets/data/essays.js"));
    }

    if (chip) chip.hidden = !anyDemo(items);
  }

  /* ============================================================
     ② 目录页
     ============================================================ */
  function initList() {
    var root = document.querySelector("[data-essay-list]");
    if (!root) return;

    var items = newestFirst();
    var count = document.querySelector("[data-essay-count]");
    var chip = document.querySelector("[data-essay-chip]");

    if (count) count.textContent = items.length ? "共 " + items.length + " 篇" : "";
    if (chip) chip.hidden = !anyDemo(items);

    root.textContent = "";

    if (!items.length) {
      root.appendChild(
        el("p", "empty-note", "还没写东西 —— 数据在 assets/data/essays.js")
      );
      return;
    }

    var ol = el("ol", "essay-list");

    items.forEach(function (essay) {
      var li = el("li");
      var row = el("a", "essay-item");
      row.href = url(essay.slug);

      row.appendChild(el("span", "essay-date", dots(essay.date)));

      var text = el("span", "essay-text");
      text.appendChild(el("strong", null, essay.title));
      if (essay.excerpt) text.appendChild(el("span", "essay-excerpt", essay.excerpt));
      row.appendChild(text);

      row.appendChild(mark(ARROW));

      li.appendChild(row);
      ol.appendChild(li);
    });

    root.appendChild(ol);
  }

  /* ============================================================
     ③ 单篇阅读页
     ============================================================ */
  function initReader() {
    var root = document.querySelector("[data-essay-reader]");
    if (!root) return;

    var match = /[?&]p=([^&]*)/.exec(window.location.search);
    var slug = match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
    var items = newestFirst();
    var index = -1;

    items.forEach(function (essay, i) {
      if (essay.slug === slug) index = i;
    });

    var host = root.querySelector("[data-essay-content]") || root;
    var navBox = root.querySelector("[data-essay-nav]");

    if (index < 0) {
      var t = root.querySelector("[data-essay-title]");
      if (t) t.textContent = "没找到这篇";
      var e = root.querySelector("[data-essay-eyebrow]");
      if (e) e.textContent = "随笔";
      host.appendChild(
        el("p", "empty-note", "地址里的 p 参数对不上任何一篇随笔，回目录看看。")
      );
      if (navBox) navBox.hidden = true;
      return;
    }

    var essay = items[index];
    var base = baseOf(root);

    document.title = essay.title + " · 夜坐所安的小屋";

    /* 头：日期 · 随笔 + 标题 */
    var eyebrow = root.querySelector("[data-essay-eyebrow]");
    if (eyebrow) eyebrow.textContent = (dots(essay.date) || "") + " · 随笔";

    var title = root.querySelector("[data-essay-title]");
    if (title) title.textContent = essay.title;

    /* 正文 */
    renderBody(host, essay.body);

    /* 配图：挂在 article 上（不是正文里），宽屏时靠右、窄屏时落在正文之后 ——
       两种情况都靠 page.css 第 8 节的 .essay.has-figure 控制 */
    if (essay.image) {
      var article = root.querySelector(".essay");
      var figure = el("figure", "essay-figure");
      var img = el("img");
      img.src = base + essay.image;
      img.alt = "";
      img.loading = "lazy";
      figure.appendChild(img);

      if (article) {
        article.classList.add("has-figure");
        article.appendChild(figure);
      } else {
        host.appendChild(figure);
      }
    }

    /* 前一篇（更新）/ 后一篇（更早） */
    var nav = navBox;
    if (nav) {
      var newer = items[index - 1];
      var older = items[index + 1];

      if (newer) {
        var a = el("a", "essay-nav-item prev");
        a.href = url(newer.slug);

        var topA = el("span", "essay-nav-top");
        topA.appendChild(mark(ARROW_LEFT));
        topA.appendChild(el("span", "essay-nav-label", "更新的一篇"));

        a.appendChild(topA);
        a.appendChild(el("strong", null, newer.title));
        nav.appendChild(a);
      }

      if (older) {
        var b = el("a", "essay-nav-item next");
        b.href = url(older.slug);

        var topB = el("span", "essay-nav-top");
        topB.appendChild(el("span", "essay-nav-label", "更早的一篇"));
        topB.appendChild(mark(ARROW));

        b.appendChild(topB);
        b.appendChild(el("strong", null, older.title));
        nav.appendChild(b);
      }

      if (!newer && !older) nav.hidden = true;
    }
  }

  initCard();
  initList();
  initReader();
})();
