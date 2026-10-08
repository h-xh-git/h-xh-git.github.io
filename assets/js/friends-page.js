/* ============================================================
   friends-page.js — 「友链」栏目页：自适应网格卡片
   朋友数据全部来自 assets/data/friends.js，本文件只负责排版。

   排布规则（设计规格 ⑤ 友链页）：
     · 网格 repeat(auto-fill, minmax(min(100%,280px),1fr))、间距 20px，
       列数随宽度自己变，窄屏自然落到单列（不用手写断点）
     · 卡片 padding 26px、圆角 13px；顶部一行 = 56×56 圆角 16px 头像
       （没头像就显示名称首字，按 3n+1 / 3n+2 / 3n 轮换三种柔和底色）+ 右上箭头
     · 下面：网站名 20px → 简介 13px/1.8 → 底部署名行（分隔线上 15px，带链接图标）
     · 没数据：虚线边框 + 62px 圆形图标 + 标题 + 一句引导，最小高 310px

   跟项目页一样：整张卡只在填了 url 时才可点，此时右上角才有箭头 ——
   不可点的卡片不摆一个箭头装样子。
   ============================================================ */
(function () {
  var root = document.querySelector("[data-friends]");
  if (!root) return;

  var base = root.getAttribute("data-base") || "";
  var list = root.querySelector("[data-friend-list]");
  var empty = root.querySelector("[data-friend-empty]");
  if (!list) return;

  var friends = (window.FRIENDS || []).filter(function (f) {
    return f && f.name;
  });

  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M7 17 17 7M9 7h8v8"/></svg>';

  var LINK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10.6 13.4a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 0 0-5.66-5.66l-1.41 1.42"/>' +
    '<path d="M13.4 10.6a4 4 0 0 0-5.66 0l-2.83 2.83a4 4 0 0 0 5.66 5.66l1.41-1.42"/></svg>';

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

  /* 从地址里取域名，取不到就返回空 */
  function domainOf(url) {
    try {
      return String(new URL(url).hostname).replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  /* ---------- 头像：有图用图，没图用首字 ---------- */
  function avatarOf(friend, index) {
    var box = el("span", "friend-avatar");
    /* 三种柔和底色按 3n+1 / 3n+2 / 3n 轮换 */
    box.className += " tone-" + ((index % 3) + 1);

    if (friend.avatar) {
      var img = el("img");
      img.src = base + friend.avatar;
      img.alt = "";
      /* 头像是小图、数量也不多，直接加载就行 —— 卡片露出头来时空着一块更难看 */
      img.decoding = "async";
      box.appendChild(img);
    } else {
      /* 中英文都取第一个字符；前端用 Array.from 避免把 emoji 切坏 */
      var chars = Array.from(String(friend.name).trim());
      box.textContent = chars.length ? chars[0] : "友";
      box.setAttribute("aria-hidden", "true");
    }

    return box;
  }

  /* ---------- 一张卡 ---------- */
  function buildItem(friend, index) {
    var li = el("li", "friend-item");

    var card = friend.url ? el("a", "friend-card") : el("div", "friend-card");
    if (friend.url) {
      card.href = friend.url;
      card.target = "_blank";
      card.rel = "noopener";
    }

    var top = el("div", "friend-top");
    top.appendChild(avatarOf(friend, index));

    if (friend.url) {
      var arrow = el("span", "friend-arrow");
      arrow.setAttribute("aria-hidden", "true");
      arrow.appendChild(mark(ARROW));
      top.appendChild(arrow);
    }
    card.appendChild(top);

    card.appendChild(el("h3", "friend-name", friend.name));
    if (friend.intro) card.appendChild(el("p", "friend-intro", friend.intro));

    /* 底部署名行：优先用 sign，没写就退到域名 */
    var sign = friend.sign || domainOf(friend.url);
    if (sign) {
      var foot = el("span", "friend-sign");
      foot.appendChild(mark(LINK));
      foot.appendChild(el("span", null, sign));
      card.appendChild(foot);
    }

    li.appendChild(card);
    return li;
  }

  /* ---------- 计数 / 空状态 / 初始化 ---------- */
  function renderCount() {
    var box = root.querySelector("[data-friend-count]");
    if (box) box.textContent = friends.length ? "共 " + friends.length + " 位朋友" : "";

    var chip = root.querySelector("[data-friend-chip]");
    if (chip) {
      chip.hidden = !friends.some(function (f) {
        return f.demo;
      });
    }
  }

  function renderEmpty() {
    if (empty) empty.hidden = friends.length > 0;
    list.hidden = friends.length === 0;
  }

  list.textContent = "";

  if (friends.length) {
    friends.forEach(function (friend, index) {
      list.appendChild(buildItem(friend, index));
    });
  }

  renderCount();
  renderEmpty();
})();
