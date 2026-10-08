/* ============================================================
   album-page.js — 「相册」栏目页：瀑布流照片墙 + 分类筛选
   照片数据全部来自 assets/data/album.js，本文件只负责排布。

   分类：
     · 顶部一排胶囊标签页「全部 / 分类…」，只显示「有照片的分类」
     · 只有一个分类（或全都没填分类）时，标签页整排不出现
     · 切换分类只换显示的卡片，照片上的编号始终是它在全部照片里的序号，
       不会因为筛了一下就换号

   排布规则（设计规格 ③ 相册页）：
     · 列数：容器 ≥1100px 四列 → ≥700px 三列 → ≥340px 两列 → 一列
       列间距：三列及以上 18px，两列及以下 12px
     · 第一张照片跨 2 列（列数 ≤2 时跨满整行）
     · 其余每张依次放进「当前最矮的那一列」
     · 卡片高 = 该列宽 ÷ 图片比例 + 信息条高(68px，三列及以下 60px) + 上下边框 2px
   高度是算出来的、不是等图片加载完量出来的，所以刷新时不会跳动。
   页面根元素上的 data-base 用来把数据里的站内路径补成当前页能用的相对路径。
   ============================================================ */
(function () {
  var root = document.querySelector("[data-album]");
  if (!root) return;

  var base = root.getAttribute("data-base") || "";
  var grid = root.querySelector("[data-album-grid]");
  var bar = root.querySelector("[data-album-filter]");
  var empty = root.querySelector("[data-album-empty]");
  if (!grid) return;

  var kinds = window.ALBUM_KINDS || [];
  var photos = (window.ALBUM || [])
    .filter(function (p) {
      return p && p.src && p.title;
    })
    .sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

  var ZOOM =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 9V5a1 1 0 0 1 1-1h4M20 15v4a1 1 0 0 1-1 1h-4' +
    'M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4"/></svg>';

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

  /* w/h 没填时按 3:2 估，排出来只是松紧不匀，不会坏 */
  function ratioOf(photo) {
    var w = Number(photo.w);
    var h = Number(photo.h);
    return w > 0 && h > 0 ? w / h : 1.5;
  }

  /* 分类：表里没有的值都归「其他」，不让照片悄悄消失 */
  var known = {};
  kinds.forEach(function (k) {
    known[k.key] = k.label;
  });

  function kindOf(photo) {
    return photo.kind && known[photo.kind] ? photo.kind : "other";
  }

  function labelOf(key) {
    return key === "other" ? "其他" : known[key] || key;
  }

  /* 有照片的分类，按 ALBUM_KINDS 的顺序，未知的排在最后 */
  function kindList() {
    var list = [];
    kinds.forEach(function (k) {
      var n = photos.filter(function (p) {
        return kindOf(p) === k.key;
      }).length;
      if (n) list.push({ key: k.key, label: k.label, n: n });
    });
    var other = photos.filter(function (p) {
      return kindOf(p) === "other";
    }).length;
    if (other) list.push({ key: "other", label: "其他", n: other });
    return list;
  }

  /* ============================================================
     ① 生成卡片（只建一次，位置由 layout() 决定）
     ============================================================ */
  var tiles = [];

  function buildTile(photo, index) {
    var figure = el("figure", "album-tile");

    var link = el("a", "album-link");
    link.href = base + photo.src;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", photo.title + "，在新窗口看原图");

    var shot = el("span", "album-shot");

    var img = el("img");
    img.src = base + photo.src;
    img.alt = photo.title;
    img.loading = "lazy";
    img.decoding = "async";
    if (photo.w && photo.h) {
      img.width = photo.w;
      img.height = photo.h;
    }
    shot.appendChild(img);
    shot.appendChild(el("span", "album-no", pad(index + 1)));

    var zoom = el("span", "album-zoom");
    zoom.setAttribute("aria-hidden", "true");
    zoom.appendChild(mark(ZOOM));
    shot.appendChild(zoom);

    var info = el("span", "album-info");
    var text = el("span", "album-text");
    text.appendChild(el("strong", null, photo.title));
    if (photo.place) text.appendChild(el("small", null, photo.place));
    info.appendChild(text);

    var arrow = el("span", "album-arrow");
    arrow.setAttribute("aria-hidden", "true");
    arrow.appendChild(mark(ARROW));
    info.appendChild(arrow);

    link.appendChild(shot);
    link.appendChild(info);
    figure.appendChild(link);

    return figure;
  }

  /* ============================================================
     ② 排布：最矮列优先（只排当前显示的那些）
     ============================================================ */
  var lastWidth = -1;

  function layout() {
    var shown = tiles.filter(function (t) {
      return !t.el.hidden;
    });
    if (!shown.length) return;

    var width = grid.clientWidth;
    var cols = width >= 1100 ? 4 : width >= 700 ? 3 : width >= 340 ? 2 : 1;
    var gap = cols <= 2 ? 12 : 18;
    var infoH = cols <= 3 ? 60 : 68;

    grid.style.setProperty("--album-cols", String(cols));
    grid.style.setProperty("--album-gap", gap + "px");
    grid.style.setProperty("--album-info", infoH + "px");
    grid.style.setProperty("--album-radius", (cols <= 2 ? 10 : 13) + "px");

    var colW = (width - gap * (cols - 1)) / cols;
    var unit = 4; /* grid-auto-rows，越小越贴，4px 够用 */
    var heights = [];
    var i;
    for (i = 0; i < cols; i++) heights.push(0);

    shown.forEach(function (tile, index) {
      var span = index === 0 ? Math.min(2, cols) : 1;
      var tileW = colW * span + gap * (span - 1);
      var height = Math.round(tileW / tile.ratio) + infoH + 2;
      var rows = Math.ceil((height + gap) / unit);

      /* 找一个起点，让它覆盖的那几列里最高的一列最矮 */
      var best = 0;
      var bestTop = Infinity;
      for (var c = 0; c + span <= cols; c++) {
        var top = 0;
        for (var k = c; k < c + span; k++) top = Math.max(top, heights[k]);
        if (top < bestTop - 0.5) {
          bestTop = top;
          best = c;
        }
      }
      if (bestTop === Infinity) bestTop = 0;

      var startRow = Math.round(bestTop / unit);
      tile.el.style.gridColumn = best + 1 + " / span " + span;
      tile.el.style.gridRow = startRow + 1 + " / span " + rows;

      var bottom = (startRow + rows) * unit;
      for (var j = best; j < best + span; j++) heights[j] = bottom;
    });

    lastWidth = width;
  }

  /* ============================================================
     ③ 分类标签页
     ============================================================ */
  var tabs = [];
  var current = ""; /* "" = 全部 */

  function apply(key) {
    current = key;

    tiles.forEach(function (tile) {
      tile.el.hidden = Boolean(key) && tile.kind !== key;
    });

    tabs.forEach(function (tab) {
      tab.el.setAttribute("aria-pressed", tab.key === key ? "true" : "false");
    });

    renderCount();
    layout();
  }

  function renderFilter() {
    if (!bar) return;

    var list = kindList();
    bar.textContent = "";

    /* 只有一个分类就没什么可筛的，整排不出现 */
    if (list.length <= 1 || photos.length <= 1) {
      bar.hidden = true;
      return;
    }

    bar.hidden = false;

    var all = { key: "", label: "全部", n: photos.length };
    [all].concat(list).forEach(function (item) {
      var btn = el("button", "album-tab");
      btn.type = "button";
      btn.setAttribute("aria-pressed", item.key === current ? "true" : "false");
      btn.appendChild(el("span", null, item.label));
      btn.appendChild(el("b", null, String(item.n)));

      btn.addEventListener("click", function () {
        apply(item.key);
      });

      bar.appendChild(btn);
      tabs.push({ key: item.key, el: btn });
    });

    /* 方向键在标签页之间走 */
    bar.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var at = tabs.map(function (t) {
        return t.el;
      }).indexOf(document.activeElement);
      if (at < 0) return;
      e.preventDefault();
      var step = e.key === "ArrowRight" ? 1 : -1;
      tabs[(at + step + tabs.length) % tabs.length].el.focus();
    });
  }

  /* ============================================================
     ④ 计数 / 空状态 / 初始化
     ============================================================ */
  function renderCount() {
    var shown = tiles.filter(function (t) {
      return !t.el.hidden;
    });

    var box = root.querySelector("[data-album-count]");
    if (box) box.textContent = shown.length ? "共 " + shown.length + " 张" : "";

    var chip = root.querySelector("[data-album-chip]");
    if (chip) {
      chip.hidden = !shown.some(function (t) {
        return t.demo;
      });
    }
  }

  function renderEmpty() {
    if (empty) empty.hidden = photos.length > 0;
    grid.hidden = photos.length === 0;
    if (bar && photos.length === 0) bar.hidden = true;
  }

  grid.textContent = "";

  photos.forEach(function (photo, index) {
    var figure = buildTile(photo, index);
    grid.appendChild(figure);
    tiles.push({
      el: figure,
      ratio: ratioOf(photo),
      kind: kindOf(photo),
      demo: Boolean(photo.demo)
    });
  });

  renderFilter();
  renderEmpty();
  apply("");

  /* 列宽一变就得重排。除了窗口缩放，还有两种会悄悄改变容器宽度的情况：
     ① 页面从「不出现滚动条」变成「出现滚动条」（首屏排布时最常见）；
     ② 分类筛选后内容变短，滚动条消失。
     所以盯容器本身，不盯 window。 */
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    /* 这里不用 requestAnimationFrame：标签页在后台时 rAF 会被浏览器暂停，
       重排就丢了；setTimeout 至少保证会跑一次。 */
    setTimeout(function () {
      pending = false;
      layout();
    }, 0);
  }

  window.addEventListener("resize", schedule);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(function () {
      if (Math.abs(grid.clientWidth - lastWidth) > 0.5) schedule();
    }).observe(grid);
  }

  /* 图片加载完后字体/滚动条可能让宽度差一两像素，再校一次 */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(function () {});
  }
})();
