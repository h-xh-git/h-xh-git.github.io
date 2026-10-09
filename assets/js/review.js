/* ============================================================
   访问与评价 · 首页「站点信息卡」那颗按钮打开的弹窗
   ------------------------------------------------------------
   评论存在 GitHub Discussions 里，靠 giscus 这套现成服务：
   访客用**自己的** GitHub 账号登录，站点里不放任何密钥
   （所以别改成用 token 直接调 API —— token 放在静态站里等于公开）。

   面板里的 giscus 脚本是「第一次点开按钮」时才注入的：
   没点过的访客完全不碰这个第三方脚本。

   ── 接线三步（做完就能用）────────────────────────────────
   1) 仓库公开，Settings → Features 勾上 Discussions；
   2) 给这个仓库装上 giscus App：https://github.com/apps/giscus
   3) 打开 https://giscus.app/zh-CN ，填仓库名、选一个分类
      （建议 Announcements），它会给出下面四个值 —— 复制粘贴到这里。
   注意：giscus 要站点在 http(s) 上才连得上 GitHub，
   所以本地 file:// 双击预览时弹窗里只会显示一句说明，属正常。
   ============================================================ */
(function () {
  /* ↓↓↓ 只有这四个值需要你填 ↓↓↓ */
  var CONFIG = {
    repo: "h-xh-git/h-xh-git.github.io", /* owner/repo，就是本站仓库 */
    repoId: "", /* R_ 开头，giscus.app 给 */
    category: "Announcements", /* Discussion 分类名 */
    categoryId: "" /* DIC_ 开头，giscus.app 给 */
  };
  /* ↑↑↑ 填完这两个空字符串就生效 ↑↑↑ */

  var MAIL = "huang_xiang_hua@163.com";
  var GITHUB = "https://github.com/h-xh-git";

  var modal = document.querySelector("[data-review-modal]");
  if (!modal) return;

  var comments = modal.querySelector("[data-review-comments]");
  var note = modal.querySelector("[data-review-note]");
  var closeButton = modal.querySelector(".review-close");
  var lastFocus = null;
  var loading = false;

  function configured() {
    return !!(CONFIG.repo && CONFIG.repoId && CONFIG.category && CONFIG.categoryId);
  }

  function showNote(html) {
    if (note) {
      note.innerHTML = html;
      note.hidden = false;
    }
    if (comments) comments.hidden = true;
  }

  /* 第一次点开时才把 giscus 的脚本装进来 */
  function mountComments() {
    if (loading || !comments) return;
    loading = true;

    if (location.protocol === "file:") {
      showNote(
        "评论区要等这个站部署到 GitHub Pages 之后才能用 —— " +
          "本地双击打开时连不上 GitHub。部署好了就能在这里用 GitHub 账号留言，" +
          '也可以先去 <a href="' + GITHUB + '" target="_blank" rel="noopener">GitHub</a> 找我。'
      );
      return;
    }

    if (!configured()) {
      showNote(
        "评论区还在接线中。想说的话可以先发到 " +
          '<a href="mailto:' + MAIL + '">' + MAIL + "</a>，" +
          '或者去 <a href="' + GITHUB + '" target="_blank" rel="noopener">GitHub</a> 留个言。'
      );
      return;
    }

    var attrs = {
      "data-repo": CONFIG.repo,
      "data-repo-id": CONFIG.repoId,
      "data-category": CONFIG.category,
      "data-category-id": CONFIG.categoryId,
      "data-mapping": "pathname",
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": "light",
      "data-lang": "zh-CN",
      "data-loading": "lazy"
    };

    var script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) script.setAttribute(key, attrs[key]);
    }
    comments.appendChild(script);
  }

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("review-open");
    if (closeButton) closeButton.focus();
    mountComments();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("review-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  /* 事件委托：按钮和弹窗里的关闭元素都用 data 属性认，不用管 DOM 顺序 */
  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") return;

    if (target.closest("[data-review-open]")) {
      event.preventDefault();
      open();
      return;
    }

    if (target.closest("[data-review-close]")) {
      event.preventDefault();
      close();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    /* 把 Tab 锁在弹窗里，不然焦点会跑到后面被锁住的页面上 */
    if (event.key !== "Tab") return;
    var panel = modal.querySelector(".review-panel");
    if (!panel) return;
    var items = panel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
    );
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    var inside = panel.contains(active);

    if (event.shiftKey && (active === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  });
})();
