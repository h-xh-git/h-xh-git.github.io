/* ============================================================
   nav.js — 临时脚本（骨架阶段）
   五个栏目页与「素材说明」尚未实现，点击时给出提示而不是跳转到 404。
   栏目页做完后，把 HTML 上的 data-pending 属性删掉即可，本文件也可整块删除。
   ============================================================ */
(function () {
  var HINT_ID = "pending-hint";

  function showHint(label) {
    var old = document.getElementById(HINT_ID);
    if (old) old.remove();

    var tip = document.createElement("div");
    tip.id = HINT_ID;
    tip.setAttribute("role", "status");
    tip.textContent = "「" + label + "」还没做 —— 想做的时候说一声";

    tip.style.cssText = [
      "position:fixed",
      "left:50%",
      "bottom:28px",
      "transform:translateX(-50%)",
      "z-index:300",
      "padding:10px 18px",
      "border-radius:8px",
      "background:#20221e",
      "color:#fffefa",
      "font-size:12.5px",
      "line-height:1.5",
      "max-width:calc(100% - 32px)",
      "box-shadow:0 6px 24px rgba(0,0,0,.18)",
      "pointer-events:none"
    ].join(";");

    document.body.appendChild(tip);
    window.setTimeout(function () {
      if (tip.parentNode) tip.remove();
    }, 2600);
  }

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-pending]");
    if (!el) return;
    event.preventDefault();
    var label =
      el.getAttribute("data-pending") ||
      el.getAttribute("aria-label") ||
      el.textContent.trim() ||
      "该功能";
    showHint(label);
  });
})();
