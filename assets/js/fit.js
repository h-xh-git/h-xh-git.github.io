/* ============================================================
   fit.js — 让装饰性元素等比缩放到容器内，永不裁切
   用法：给元素加 data-fit-to-box，容器即它的父元素。
   元素按自然尺寸布局（宽度按容器宽），再用 transform 缩放，
   所以内容不会重排，只整体缩放。
   ============================================================ */
(function () {
  var MAX_UP = 1.3;

  function fit(el) {
    var box = el.parentElement;
    if (!box) return;
    var availW = box.clientWidth;
    var availH = box.clientHeight;
    if (!availW || !availH) return;

    /* 先回到自然尺寸测量 */
    el.style.transform = "none";
    el.style.width = "100%";
    el.style.height = "auto";
    var natH = el.offsetHeight;
    if (!natH) return;

    var scale = Math.min(MAX_UP, availH / natH);
    var key = scale.toFixed(4);
    if (el.dataset.fitScale === key) return;

    /* 宽度先按比例的倒数放大，缩放后正好铺满容器宽 */
    el.style.width = (100 / scale).toFixed(4) + "%";
    el.style.height = natH + "px";
    el.style.transform = "scale(" + key + ")";
    el.dataset.fitScale = key;
  }

  function fitAll() {
    document.querySelectorAll("[data-fit-to-box]").forEach(function (el) {
      try {
        fit(el);
      } catch (err) {
        /* 单点失败不影响其它元素 */
      }
    });
  }

  fitAll();

  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { fitAll(); });
    document.querySelectorAll("[data-fit-to-box]").forEach(function (el) {
      if (el.parentElement) ro.observe(el.parentElement);
    });
  } else {
    window.addEventListener("resize", fitAll);
  }

  /* 字体晚到会改变自然高度，再补一次 */
  window.addEventListener("load", fitAll);
})();
