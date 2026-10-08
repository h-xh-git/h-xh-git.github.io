/* ============================================================
   collections-page.js — 「收集」栏目页
   数据全部来自 assets/data/collections.js，本文件只负责排版：
     链接      → 一行一条的外链列表
     书 / 影 / 音 → 三组并排
     足迹      → 时间轴（地点 + 日期 + 备注，可配照片）
   页面根元素上的 data-base 用来把数据里的站内路径补成当前页能用的相对路径
   （首页是 ""，本页在子目录里是 "../"）。
   ============================================================ */
(function () {
  var root = document.querySelector("[data-collections]");
  if (!root) return;

  var base = root.getAttribute("data-base") || "";
  var kinds = window.COLLECTION_KINDS || [];
  var items = (window.COLLECTIONS || []).filter(function (it) {
    return it && it.title;
  });

  var byKey = {};
  kinds.forEach(function (k) {
    byKey[k.key] = k;
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

  function labelOf(key) {
    return byKey[key] ? byKey[key].label : key || "其他";
  }

  function iconOf(key) {
    return byKey[key] ? byKey[key].icon : "";
  }

  /* 05-12 这种短日期，给列表用 */
  function shortDate(value) {
    return typeof value === "string" ? value.slice(5) : "";
  }

  /* 2026.05.12，给时间轴用 */
  function fullDate(value) {
    return typeof value === "string" ? value.replace(/-/g, ".") : "";
  }

  /* 按日期倒序取某一类 */
  function pick(kind) {
    return items
      .filter(function (it) {
        return it.kind === kind;
      })
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      });
  }

  function metaOf(item, sep) {
    var parts = [];
    if (item.source) parts.push(item.source);
    var day = shortDate(item.date);
    if (day) parts.push(day);
    return parts.join(sep || " · ");
  }

  /* ============================================================
     ① 分类概况
     ============================================================ */
  function renderSummary() {
    var bar = root.querySelector("[data-summary]");
    if (!bar) return;

    /* 分类计数写在每张卡的卡头里了，这里不再重复列一遍；
       「示例」标签已整体撤掉（HTML 里的 .demo-chip 和这里新建的那处一起删了），
       概况行不再放东西，直接收起来。 */
    bar.textContent = "";
    bar.hidden = true;
  }

  /* ============================================================
     ② 链接
     ============================================================ */
  function renderLinks() {
    var box = root.querySelector('[data-list="link"]');
    if (!box) return;

    var list = pick("link");
    var section = box.closest(".collect-section");

    if (!list.length) {
      if (section) section.hidden = true;
      return;
    }

    if (section) section.hidden = false;

    var ul = el("ul", "link-list");

    list.forEach(function (item) {
      var row = item.url ? el("a", "link-item") : el("div", "link-item");

      if (item.url) {
        row.href = item.url;
        row.target = "_blank";
        row.rel = "noopener";
      }

      var text = el("span", "link-text");
      text.appendChild(el("span", "link-title", item.title));

      if (item.source) text.appendChild(el("span", "link-host", item.source));

      row.appendChild(text);
      row.appendChild(el("span", "link-date", shortDate(item.date)));

      if (item.url) row.appendChild(mark(ARROW));

      ul.appendChild(el("li")).appendChild(row);
    });

    box.textContent = "";
    box.appendChild(ul);
  }

  /* ============================================================
     ③ 书影音
     ============================================================ */
  function renderMedia() {
    var box = root.querySelector('[data-list="media"]');
    if (!box) return;

    var section = box.closest(".collect-section");
    var groups = ["book", "film", "music"].filter(function (key) {
      return pick(key).length;
    });

    if (!groups.length) {
      if (section) section.hidden = true;
      return;
    }

    if (section) section.hidden = false;

    var grid = el("div", "media-grid");

    groups.forEach(function (key) {
      var group = el("div", "media-group");

      var head = el("h3", null, labelOf(key));
      if (iconOf(key)) head.insertBefore(mark(iconOf(key)), head.firstChild);

      var ul = el("ul", "media-list");

      pick(key).forEach(function (item) {
        var li = el("li", "media-item");
        li.appendChild(el("span", "media-title", item.title));
        li.appendChild(el("span", "media-meta", metaOf(item)));
        ul.appendChild(li);
      });

      group.appendChild(head);
      group.appendChild(ul);
      grid.appendChild(group);
    });

    box.textContent = "";
    box.appendChild(grid);
  }

  /* ============================================================
     ④ 足迹：时间轴
     ============================================================ */
  function renderTrail() {
    var box = root.querySelector('[data-list="place"]');
    if (!box) return;

    var list = pick("place");
    var section = box.closest(".collect-section");

    if (!list.length) {
      if (section) section.hidden = true;
      return;
    }

    if (section) section.hidden = false;

    var ol = el("ol", "trail");

    list.forEach(function (item) {
      var li = el("li", "trail-item");

      var head = el("div", "trail-head");
      head.appendChild(el("h3", null, item.title));
      if (item.date) head.appendChild(el("span", "trail-date", fullDate(item.date)));
      li.appendChild(head);

      if (item.source) li.appendChild(el("span", "trail-place", item.source));
      if (item.note) li.appendChild(el("p", "trail-note", item.note));

      if (item.image) {
        var link = el("a", "trail-photo-link");
        link.href = base + item.image;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", item.title + "的照片");

        var img = el("img", "trail-photo");
        img.src = base + item.image;
        img.alt = item.title;
        img.loading = "lazy";

        link.appendChild(img);
        li.appendChild(link);
      }

      ol.appendChild(li);
    });

    box.textContent = "";
    box.appendChild(ol);
  }

  /* ============================================================
     计数 + 初始化
     ============================================================ */
  function renderCounts() {
    var map = {
      link: { n: pick("link").length, text: "条" },
      media: {
        n: pick("book").length + pick("film").length + pick("music").length,
        text: "条"
      },
      place: { n: pick("place").length, text: "个地方" }
    };

    Object.keys(map).forEach(function (key) {
      var node = root.querySelector('[data-count="' + key + '"]');
      if (!node) return;
      var info = map[key];
      node.textContent = info.n ? "共 " + info.n + " " + info.text : "";
    });
  }

  function renderEmpty() {
    if (items.length) return;
    var box = root.querySelector('[data-summary]');
    if (box) {
      box.textContent = "";
      box.hidden = false;
      box.appendChild(el("p", "collect-empty", "还没收东西 —— 数据在 assets/data/collections.js"));
    }
    ["link", "media", "place"].forEach(function (key) {
      var box2 = root.querySelector('[data-list="' + key + '"]');
      var section = box2 && box2.closest(".collect-section");
      if (section) section.hidden = true;
    });
  }

  /* ============================================================
     ⑤ 卡片头部的小图标
     图标只在 COLLECTION_KINDS 里维护一份，HTML 上写 data-icon="link" 就行
     ============================================================ */
  function renderIcons() {
    Array.prototype.forEach.call(root.querySelectorAll("[data-icon]"), function (node) {
      var html = iconOf(node.getAttribute("data-icon"));
      if (!html) return;
      node.appendChild(mark(html));

      /* 同一枚图标在卡片右下角再来一个大的（浅色水印，样式在 page.css 第 12 节） */
      var card = node.closest(".collect-section");
      if (!card || card.querySelector(".collect-glyph")) return;

      var glyph = el("span", "collect-glyph");
      glyph.appendChild(mark(html));
      card.appendChild(glyph);
    });
  }

  renderIcons();
  renderSummary();
  renderCounts();
  renderLinks();
  renderMedia();
  renderTrail();
  renderEmpty();
})();
