/* ============================================================
   clock.js — 时钟卡（广州时间，不含天气）
   纯前端，只依赖 Intl.DateTimeFormat，离线可用。
   时区改动只需修改 TZ / CITY 两处。
   ============================================================ */
(function () {
  var TZ = "Asia/Shanghai";
  var CITY = "广州";

  var root = document.querySelector(".clock-card");
  var hourEl = document.querySelector(".clock-hour");
  var minuteEl = document.querySelector(".clock-minute");
  var dateEl = document.querySelector(".clock-day");
  var weekEl = document.querySelector(".clock-weekday");
  var zoneEl = document.querySelector(".clock-zone");
  var cityEl = document.querySelector(".clock-city");

  if (!root || !hourEl || !minuteEl || !dateEl || !weekEl || !zoneEl) return;

  if (cityEl) cityEl.textContent = CITY;

  var hhmmFmt, dateFmt, weekFmt, zoneFmt, offsetFmt;

  try {
    /* 一个格式化器同时给出时与分，拆分后再写入两处，避免分字段被漏掉 */
    hhmmFmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
    weekFmt = new Intl.DateTimeFormat("zh-CN", { timeZone: TZ, weekday: "short" });
    zoneFmt = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, timeZoneName: "short" });
    offsetFmt = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, timeZoneName: "shortOffset" });
  } catch (err) {
    zoneEl.textContent = TZ;
    return;
  }

  var last = {};

  function pick(formatter, now, type) {
    var parts = formatter.formatToParts(now);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].type === type) return parts[i].value;
    }
    return "";
  }

  function write(el, key, value) {
    if (last[key] === value) return;
    last[key] = value;
    el.textContent = value;
  }

  function tick() {
    var now = new Date();
    var hhmm = hhmmFmt.format(now).split(":");
    write(hourEl, "h", hhmm[0] || "--");
    write(minuteEl, "m", hhmm[1] || "--");
    write(dateEl, "d", dateFmt.format(now).replace(/-/g, "."));
    write(weekEl, "w", weekFmt.format(now));

    var zone = pick(zoneFmt, now, "timeZoneName").replace("GMT", "UTC");
    var offset = pick(offsetFmt, now, "timeZoneName").replace("GMT", "UTC");
    write(zoneEl, "z", zone === offset ? offset : zone + " · " + offset);
  }

  tick();
  setInterval(tick, 1000);
})();
