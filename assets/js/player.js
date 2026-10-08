/* ============================================================
   player.js — 全站音乐播放器
   歌单来自 assets/music/playlist.js（数组顺序 = 列表顺序）。
   每条可以只写文件名（走 assets/music/），也可以直接写完整地址 ——
   想把歌放对象存储 / CDN / Releases 上，就在歌单里硬编码地址。
   纯前端、零依赖；音频走 <audio> 元素而不是 fetch，
   所以在 file://（双击 index.html）下也能正常播放。

   两种界面，共用同一套逻辑：
   · 首页那张大卡 .music-card（歌单、进度、音量都在卡里）
   · 栏目页右下角的迷你条 .music-bar —— 由本文件自己造出来，
     只在「这一会儿确实在放歌」时才出现，没在放就完全看不见。

   换页为什么原来会断：每个页面是一个独立文档，换页时 <audio> 被销毁。
   所以这里把「第几首 + 播到几秒 + 是否在放」写进 sessionStorage
   （退路 localStorage 和 window.name），下一页读回来接着放。
   浏览器若拦下自动播放（NotAllowedError），迷你条会进入
   is-pending 状态，用户点哪儿都行，第一下就把音乐接上。
   ============================================================ */
(function () {
  var SESSION_KEY = "yezuo-player-session";
  var OFF_KEY = "yezuo-player-off"; /* 点了迷你条上的 ✕：这个标签页里就别再冒出来了 */
  var STORE_KEY = "yezuo-player"; /* 音量 / 上次听的是哪一首，沿用原来的键 */
  var NAME_PREFIX = "yezuoSess:";
  var FRESH_MS = 30000; /* 状态超过这么久就不自动续播：关了标签页过半天再打开，别突然出声 */

  var names = (window.MUSIC_PLAYLIST || []).filter(function (n) {
    return typeof n === "string" && n;
  });

  var card = document.querySelector(".music-card");

  /* 站点根目录：从本脚本自己的 URL 推，栏目页在子目录里也能算对 */
  var MUSIC_DIR = (function () {
    var node = document.currentScript;
    var src = (node && node.getAttribute("src")) || "assets/js/player.js";
    return src.replace(/assets\/js\/player\.js.*$/, "") + "assets/music/";
  })();

  /* 歌单里每一条的解析规则：
     · 只写文件名（xxx.mp3）→ 拼成 assets/music/xxx.mp3
     · 完整地址（http(s)://、//）或带斜杠的路径（/xx、assets/xx）→ 原样用
     所以换托管时不用改逻辑，直接在 playlist.js 里硬编码地址就行 */
  function trackSrc(name) {
    var s = String(name || "");
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.indexOf("//") === 0 || s.indexOf("/") >= 0) return s;
    return MUSIC_DIR + encodeURIComponent(s);
  }

  var audio = new Audio();
  audio.preload = "metadata";

  var root = card; /* 界面根：首页是那张卡，栏目页是迷你条 */
  var bar = null;
  var current = 0;
  var scrubbing = false;
  var failStreak = 0;
  var pendingGesture = false;
  var lastSavedAt = 0;

  var els = {};

  /* ---------- 存储 ---------- */
  function recall() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function store(data) {
    try {
      var all = recall();
      Object.keys(data).forEach(function (k) {
        all[k] = data[k];
      });
      window.localStorage.setItem(STORE_KEY, JSON.stringify(all));
      return all;
    } catch (err) {
      return data;
    }
  }

  /* 三个地方都写一份：sessionStorage 是正路，另外两个是退路 */
  function writeSession(raw) {
    try { window.sessionStorage.setItem(SESSION_KEY, raw); } catch (err) {}
    try { window.localStorage.setItem(SESSION_KEY, raw); } catch (err) {}
    try { window.name = NAME_PREFIX + raw; } catch (err) {}
  }

  function readSession() {
    var raw = "";
    try { raw = window.sessionStorage.getItem(SESSION_KEY) || ""; } catch (err) {}
    if (!raw) {
      try { raw = window.localStorage.getItem(SESSION_KEY) || ""; } catch (err) {}
    }
    if (!raw && window.name && window.name.indexOf(NAME_PREFIX) === 0) {
      raw = window.name.slice(NAME_PREFIX.length);
    }
    try {
      var data = JSON.parse(raw);
      if (data && typeof data.track === "number") return data;
    } catch (err) {}
    return null;
  }

  var session = readSession();
  var sessionFresh = !!(session && session.ts && Date.now() - session.ts < FRESH_MS);
  var prefs = recall();

  function saveSession(force) {
    /* 这个页面根本没启用播放器（连迷你条都没造）、或者刚被 ✕ 关掉，就别写：
       否则会把别的页面刚存下的进度覆盖成 0，或者让关掉的条子又活过来 */
    if (!root || !names.length || isOff()) return;
    var now = Date.now();
    if (!force && now - lastSavedAt < 2000) return;
    lastSavedAt = now;
    writeSession(JSON.stringify({
      track: current,
      time: audio.currentTime || 0,
      playing: !audio.paused && !audio.ended,
      ts: now
    }));
  }

  function clearSession() {
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch (err) {}
    try { window.localStorage.removeItem(SESSION_KEY); } catch (err) {}
    try { if (window.name.indexOf(NAME_PREFIX) === 0) window.name = ""; } catch (err) {}
  }

  function setOff(on) {
    try {
      if (on) {
        window.sessionStorage.setItem(OFF_KEY, "1");
      } else {
        window.sessionStorage.removeItem(OFF_KEY);
      }
    } catch (err) {}
  }

  function isOff() {
    try {
      return window.sessionStorage.getItem(OFF_KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  /* ---------- 小工具 ---------- */
  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function $(sel) {
    return root ? root.querySelector(sel) : null;
  }

  function setText(node, text) {
    if (node) node.textContent = text;
  }

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function nameOf(i) {
    /* 从「文件名」或「完整地址」里取出显示用的名字（去掉路径、查询串和扩展名） */
    var raw = String(names[i] || "");
    var base = raw.split("#")[0].split("?")[0].split("/").pop() || raw;
    return base.replace(/\.[^.\\/]+$/, "");
  }

  function paintPct(pct) {
    if (els.progress) els.progress.style.setProperty("--p", pct + "%");
    if (bar) bar.style.setProperty("--p", pct + "%");
  }

  function playingClass(on) {
    if (root) root.classList.toggle("is-playing", !!on);
  }

  /* ---------- 迷你条（栏目页；有歌在放才露面） ---------- */
  function buildBar() {
    if (card || !names.length) return;
    var node = el("div", "music-bar");
    node.hidden = true;
    node.setAttribute("role", "group");
    node.setAttribute("aria-label", "音乐播放器");

    node.innerHTML = [
      '<button class="music-play" type="button" aria-label="播放">',
        '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
        '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5h4v15H7zM13 4.5h4v15h-4z"/></svg>',
      "</button>",
      '<div class="music-bar-meta">',
        '<strong class="music-title">—</strong>',
        '<input class="music-progress" type="range" min="0" max="1" step="1" value="0" aria-label="播放进度" />',
      "</div>",
      '<span class="music-elapsed">0:00</span>',
      '<button class="music-prev bar-icon" type="button" aria-label="上一首">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 20 9 12l10-8z"/><path d="M5 19V5"/></svg>',
      "</button>",
      '<button class="music-next bar-icon" type="button" aria-label="下一首">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/></svg>',
      "</button>",
      '<button class="music-close bar-icon" type="button" aria-label="关掉音乐条">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
      "</button>"
    ].join("");

    document.body.appendChild(node);
    bar = node;
    root = node;
    bindUI();
  }

  /* ---------- 界面元素（大卡与迷你条共用同名 class） ---------- */
  function bindUI() {
    els.title = $(".music-title");
    els.index = $(".music-index");
    els.play = $(".music-play");
    els.prev = $(".music-prev");
    els.next = $(".music-next");
    els.mute = $(".music-mute");
    els.progress = $(".music-progress");
    els.elapsed = $(".music-elapsed");
    els.duration = $(".music-duration");
    els.volume = $(".music-volume");
    els.listPanel = $(".music-list");
    els.listToggle = $(".music-list-toggle");
    els.listClose = $(".music-list-close");
    els.listBox = $(".music-list-items");
    els.close = $(".music-close");
  }

  function bindEvents() {
    if (els.play) els.play.addEventListener("click", toggle);
    if (els.prev) els.prev.addEventListener("click", function () {
      /* 播过 3 秒以上：回到开头；否则切上一首 */
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        if (els.progress) els.progress.value = "0";
        paintPct(0);
        setText(els.elapsed, "0:00");
        return;
      }
      failStreak = 0;
      load(current - 1, !audio.paused);
    });
    if (els.next) els.next.addEventListener("click", function () {
      failStreak = 0;
      load(current + 1, !audio.paused);
    });
    if (els.mute) els.mute.addEventListener("click", function () {
      audio.muted = !audio.muted;
      els.mute.classList.toggle("is-muted", audio.muted);
      els.mute.setAttribute("aria-label", audio.muted ? "取消静音" : "静音");
    });
    if (els.close) els.close.addEventListener("click", function () {
      audio.pause();
      clearSession();
      setOff(true);
      if (bar) bar.hidden = true;
    });
    if (els.volume) els.volume.addEventListener("input", function () {
      audio.volume = els.volume.value / 100;
      if (audio.volume > 0 && audio.muted) {
        audio.muted = false;
        if (els.mute) {
          els.mute.classList.remove("is-muted");
          els.mute.setAttribute("aria-label", "静音");
        }
      }
      store({ volume: +els.volume.value });
    });
    if (els.progress) {
      els.progress.addEventListener("input", function () {
        scrubbing = true;
        var max = +els.progress.max || 1;
        paintPct((els.progress.value / max) * 100);
        setText(els.elapsed, fmt(+els.progress.value));
      });
      els.progress.addEventListener("change", function () {
        audio.currentTime = +els.progress.value;
        scrubbing = false;
        saveSession(true);
      });
    }
    if (els.listToggle) {
      els.listToggle.addEventListener("click", function () {
        setList(els.listPanel && els.listPanel.hasAttribute("hidden"));
      });
    }
    if (els.listClose) {
      els.listClose.addEventListener("click", function () {
        setList(false);
        els.listToggle.focus();
      });
    }
    if (els.listBox) {
      els.listBox.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-track]");
        if (!btn) return;
        failStreak = 0;
        load(+btn.getAttribute("data-track"), true);
        setList(false);
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && els.listPanel && !els.listPanel.hasAttribute("hidden")) {
        setList(false);
        els.listToggle.focus();
      }
    });
  }

  /* ---------- 播放列表（只有大卡有） ---------- */
  function buildList() {
    if (!els.listBox) return;
    var frag = document.createDocumentFragment();

    names.forEach(function (name, i) {
      var li = el("li");
      var btn = el("button");
      btn.type = "button";
      btn.setAttribute("data-track", String(i));
      btn.innerHTML = '<span class="n">' + pad(i + 1) + '</span><span class="t"></span>';
      btn.querySelector(".t").textContent = nameOf(i);
      li.appendChild(btn);
      frag.appendChild(li);
    });

    els.listBox.innerHTML = "";
    els.listBox.appendChild(frag);
  }

  function markList() {
    if (!els.listBox) return;
    var items = els.listBox.children;
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("current", i === current);
    }
  }

  function setList(open) {
    if (!els.listPanel) return;
    if (open) {
      els.listPanel.removeAttribute("hidden");
    } else {
      els.listPanel.setAttribute("hidden", "");
    }
    if (els.listToggle) {
      els.listToggle.setAttribute("aria-expanded", String(open));
      els.listToggle.classList.toggle("is-open", open);
    }
  }

  /* ---------- 播放控制 ---------- */
  function doPlay() {
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function (err) {
        var name = (err && err.name) || "";
        if (name === "NotAllowedError" || name === "NotAllowed") {
          /* 被拦时浏览器也会先发一个 play 事件，这里得把「正在播放」的样子收回去，
             不然会出现「暂停图标 + 点一下继续」这种前后矛盾的界面 */
          playingClass(false);
          armGestureResume();
          return;
        }
        /* 别的错（文件缺失等）：保持暂停并跳过这一首 */
        playingClass(false);
        skip();
      });
    }
  }

  function armGestureResume() {
    if (pendingGesture) return;
    pendingGesture = true;
    if (root) root.classList.add("is-pending");
    if (bar) setText(els.title, "点一下继续 · " + nameOf(current));
    document.addEventListener("pointerdown", onFirstGesture, true);
    document.addEventListener("keydown", onFirstGesture, true);
  }

  function onFirstGesture() {
    if (!pendingGesture) return;
    pendingGesture = false;
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstGesture, true);
    if (root) root.classList.remove("is-pending");
    setText(els.title, nameOf(current));
    doPlay();
  }

  function toggle() {
    if (audio.paused) {
      if (!audio.src) {
        load(current, false);
      }
      doPlay();
    } else {
      audio.pause();
    }
  }

  function load(i, autoplay) {
    current = ((i % names.length) + names.length) % names.length;

    audio.src = trackSrc(names[current]);

    setText(els.title, nameOf(current));
    setText(els.index, pad(current + 1) + " / " + pad(names.length));
    if (els.progress) {
      els.progress.disabled = false;
      els.progress.value = "0";
    }
    paintPct(0);
    setText(els.elapsed, "0:00");
    setText(els.duration, "0:00");
    markList();

    if (autoplay) doPlay();
  }

  function skip() {
    failStreak += 1;
    if (failStreak >= names.length) {
      setText(els.title, "这些歌都打不开");
      setText(els.index, "检查 playlist.js 里的文件名或地址是否可用");
      playingClass(false);
      failStreak = 0;
      return;
    }
    load(current + 1, true);
  }

  /* ---------- 空歌单的兜底 ---------- */
  if (!names.length) {
    if (card) {
      setText(card.querySelector(".music-title"), "还没放音乐");
      setText(card.querySelector(".music-index"), "把音频地址写进 playlist.js");
      Array.prototype.forEach.call(
        card.querySelectorAll("button, input"),
        function (b) { b.disabled = true; }
      );
    }
    return;
  }

  /* ---------- 事件：音频 ---------- */
  audio.addEventListener("play", function () {
    playingClass(true);
    setOff(false); /* 又开播了，之前关掉的记录作废 */
    if (els.play) els.play.setAttribute("aria-label", "暂停");
    store({ track: current });
    saveSession(true);
  });

  audio.addEventListener("pause", function () {
    playingClass(false);
    if (els.play) els.play.setAttribute("aria-label", "播放");
    saveSession(true);
  });

  audio.addEventListener("loadedmetadata", function () {
    setText(els.duration, fmt(audio.duration));
    /* 进度条按「秒」计数：方向键 ±1 秒，PageUp / PageDown 大跳，
       比 0~1000 的抽象刻度好用 */
    if (els.progress) {
      var d = Math.round(audio.duration);
      els.progress.max = String(d > 0 ? d : 1);
    }
  });

  audio.addEventListener("timeupdate", function () {
    if (scrubbing) return;
    var d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    if (els.progress) els.progress.value = String(Math.round(audio.currentTime));
    paintPct((audio.currentTime / d) * 100);
    setText(els.elapsed, fmt(audio.currentTime));
    saveSession(false); /* 内部有 2 秒节流 */
  });

  audio.addEventListener("ended", function () {
    failStreak = 0;
    load(current + 1, true);
  });

  audio.addEventListener("error", function () {
    if (audio.src) skip();
  });

  audio.addEventListener("volumechange", function () {
    if (bar) bar.style.setProperty("--vol", audio.volume);
  });

  /* ---------- 换页前把状态留住 ---------- */
  window.addEventListener("pagehide", function () { saveSession(true); });
  window.addEventListener("beforeunload", function () { saveSession(true); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) saveSession(true);
  });

  /* ---------- 初始化 ---------- */
  bindUI();

  if (typeof prefs.volume === "number" && prefs.volume >= 0 && prefs.volume <= 100) {
    if (els.volume) els.volume.value = prefs.volume;
  }
  audio.volume = els.volume ? els.volume.value / 100 : (typeof prefs.volume === "number" ? prefs.volume / 100 : 1);

  var startTrack =
    sessionFresh && typeof session.track === "number" ? session.track :
    typeof prefs.track === "number" ? prefs.track : 0;
  if (startTrack < 0 || startTrack >= names.length) startTrack = 0;

  var shouldResume = !!(sessionFresh && session.playing && !isOff());

  if (card) {
    /* 首页大卡：永远显示当前这首歌 */
    buildList();
    load(startTrack, false);
    setList(false);
  } else if (!isOff() && sessionFresh && session.time > 0) {
    /* 栏目页：只有「刚刚还在放（或刚暂停）」才造迷你条 */
    buildBar();
    load(startTrack, false);
  } else {
    return;
  }

  bindEvents();

  if (sessionFresh && typeof session.time === "number" && session.time > 0) {
    var seekTo = session.time;
    var once = function () {
      audio.removeEventListener("loadedmetadata", once);
      if (seekTo > 0.5 && isFinite(audio.duration) && seekTo < audio.duration - 1.5) {
        audio.currentTime = seekTo;
      }
      if (shouldResume) doPlay();
    };
    audio.addEventListener("loadedmetadata", once);
    if (audio.readyState >= 1) once();
  } else if (shouldResume) {
    doPlay();
  }

  if (bar) {
    bar.hidden = false;
    /* 续播被浏览器拦下时要有个明确的说法，不然像是卡住了 */
    if (shouldResume) {
      bar.classList.add("is-pending");
      setText(els.title, "点一下继续 · " + nameOf(current));
    }
  }
})();
