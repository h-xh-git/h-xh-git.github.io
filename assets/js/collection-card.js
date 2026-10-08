/* ============================================================
   collection-card.js — 首页「最近收集」卡
   数据在 assets/data/collections.js（链接 / 书 / 影 / 音 / 足迹）。
   卡上只出最近的两条 + 一行分类计数，全部内容留给「收集」栏目页。
   ============================================================ */
(function () {
  var card = document.querySelector(".collection-card");
  if (!card) return;

  var kinds = window.COLLECTION_KINDS || [];
  var items = (window.COLLECTIONS || []).filter(function (it) {
    return it && it.title;
  });

  var listEl = card.querySelector(".collection-list");
  var kindsEl = card.querySelector(".collection-kinds");
  var chipEl = card.querySelector(".demo-chip");

  if (!listEl) return;

  var byKey = {};
  kinds.forEach(function (k) {
    byKey[k.key] = k;
  });

  function labelOf(key) {
    return byKey[key] ? byKey[key].label : key || "其他";
  }

  function iconOf(key) {
    return byKey[key] ? byKey[key].icon : "";
  }

  function shortDate(value) {
    return typeof value === "string" ? value.slice(5) : "";
  }

  /* ---------- 最近的两条 ---------- */
  function renderItems() {
    var latest = items
      .slice()
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      })
      .slice(0, 2);

    listEl.textContent = "";

    if (!latest.length) {
      var empty = document.createElement("p");
      empty.className = "collection-empty";
      empty.textContent = "还没收东西 —— 数据在 assets/data/collections.js";
      listEl.appendChild(empty);
      if (chipEl) chipEl.style.display = "none";
      return;
    }

    var anyDemo = false;

    latest.forEach(function (item) {
      if (item.demo) anyDemo = true;

      var link = document.createElement("a");
      link.className = "collection-item";

      if (item.url) {
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        /* 站内条目统一指向「收集」栏目页 */
        link.href = "collections/index.html";
      }

      var thumb = document.createElement("span");
      thumb.className = "collection-thumb";

      if (item.image) {
        var img = document.createElement("img");
        img.src = item.image;
        img.alt = "";
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        /* 图标来自本地常量 COLLECTION_KINDS，不含任何外部数据 */
        thumb.innerHTML = iconOf(item.kind);
      }

      var text = document.createElement("span");
      text.className = "collection-text";

      var strong = document.createElement("strong");
      strong.textContent = item.title;

      var meta = document.createElement("small");
      var parts = [labelOf(item.kind)];
      if (item.source) parts.push(item.source);
      var day = shortDate(item.date);
      if (day) parts.push(day);
      meta.textContent = parts.join(" · ");

      text.appendChild(strong);
      text.appendChild(meta);
      link.appendChild(thumb);
      link.appendChild(text);
      listEl.appendChild(link);
    });

    /* 全是真实内容时，把「示例」标签收掉 */
    if (chipEl && !anyDemo) chipEl.style.display = "none";
  }

  /* ---------- 分类计数 ---------- */
  function renderKinds() {
    if (!kindsEl) return;
    kindsEl.textContent = "";

    kinds.forEach(function (kind) {
      var count = items.filter(function (it) {
        return it.kind === kind.key;
      }).length;

      var span = document.createElement("span");
      span.className = "kind";

      var num = document.createElement("b");
      num.textContent = String(count);

      span.appendChild(num);
      span.appendChild(document.createTextNode(kind.label));
      kindsEl.appendChild(span);
    });
  }

  renderItems();
  renderKinds();
})();
