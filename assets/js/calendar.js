/* ============================================================
   calendar.js — 日历卡（广州时区，周一为一周起点）
   纯前端，无依赖。逻辑对齐模板 CalendarCard：
   翻月、今天高亮为柠檬绿圆、翻月后底部提示变成「回到今天」。
   ============================================================ */
(function () {
  var TZ = "Asia/Shanghai";

  var monthEl = document.querySelector(".calendar-month");
  var monthEnEl = document.querySelector(".calendar-month-en");
  var yearEl = document.querySelector(".calendar-year");
  var grid = document.querySelector(".calendar-grid");
  var footer = document.querySelector(".calendar-footer");
  var prev = document.querySelector(".month-prev");
  var next = document.querySelector(".month-next");

  if (!monthEl || !monthEnEl || !yearEl || !grid || !footer || !prev || !next) return;

  var MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月",
                "七月", "八月", "九月", "十月", "十一月", "十二月"];
  var MONTHS_EN = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                   "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  var WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

  /* 先取到「广州的今天」，再按 UTC 做纯日期运算，避免夏令时/跨时区偏移 */
  var dayFmt;
  try {
    dayFmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    });
  } catch (err) {
    return;
  }

  var todayParts = dayFmt.format(new Date()).split("-").map(Number);
  var today = { y: todayParts[0], m: todayParts[1], d: todayParts[2] };
  var offset = 0;
  var rowCount = 0;

  /* 网格高度由 flex 剩余空间决定，格子尺寸再反算出来，
     这样卡片在矮视口下变矮时，日期格会自己缩小而不会把底部提示挤出去 */
  function fitCells() {
    if (!rowCount) return;
    var h = grid.clientHeight;
    if (!h) return;
    var gap = 1;
    var cell = Math.floor((h - gap * (rowCount - 1)) / rowCount);
    cell = Math.max(15, Math.min(29, cell));
    var next = cell + "px";
    if (grid.style.getPropertyValue("--cal-cell") !== next) {
      grid.style.setProperty("--cal-cell", next);
    }
  }

  var label = footer.lastChild;
  if (label.nodeType !== 3) label = null;

  function setFooterLabel(text) {
    if (label) {
      label.nodeValue = text;
    } else {
      footer.textContent = text;
    }
  }

  function render() {
    var cursor = new Date(Date.UTC(today.y, today.m - 1 + offset, 1));
    var y = cursor.getUTCFullYear();
    var m = cursor.getUTCMonth();

    monthEl.textContent = MONTHS[m];
    monthEnEl.textContent = MONTHS_EN[m];
    yearEl.textContent = String(y);

    /* 周一为第一列：把 getUTCDay()（周日=0）换算成周一=0 */
    var blanks = (cursor.getUTCDay() + 6) % 7;
    var total = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    var isThisMonth = offset === 0;

    var frag = document.createDocumentFragment();
    var i;
    for (i = 0; i < 7; i++) {
      var head = document.createElement("span");
      head.className = "weekday";
      head.textContent = WEEKDAYS[i];
      frag.appendChild(head);
    }
    for (i = 0; i < blanks; i++) frag.appendChild(document.createElement("span"));
    for (i = 1; i <= total; i++) {
      var cell = document.createElement("span");
      cell.textContent = String(i);
      if (isThisMonth && i === today.d) {
        cell.className = "today";
        cell.setAttribute("aria-current", "date");
      }
      frag.appendChild(cell);
    }

    grid.textContent = "";
    grid.appendChild(frag);

    rowCount = grid.children.length / 7;
    fitCells();

    setFooterLabel(offset ? "回到今天" : "今天也适合开始。");
    footer.setAttribute("aria-label", offset ? "回到今天" : "今天也适合开始。");
  }

  prev.addEventListener("click", function () { offset -= 1; render(); });
  next.addEventListener("click", function () { offset += 1; render(); });
  footer.addEventListener("click", function () {
    if (offset === 0) return;
    offset = 0;
    render();
  });

  /* 视口或字体变化会改变网格高度，跟着重算一次 */
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { fitCells(); });
    ro.observe(grid);
  } else {
    window.addEventListener("resize", fitCells);
  }

  render();
})();
