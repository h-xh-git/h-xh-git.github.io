/* ============================================================
   site.js — 站点信息卡
   四个数字都是现算的，其余是 HTML 里的静态文案：
   ① 在站天数：从下面的 START 算到今天；
   ② 音乐首数：取自 assets/music/playlist.js 的歌单长度；
   ③ 随笔篇数：取自 assets/data/essays.js 的篇数；
   ④ 照片张数：取自 assets/data/album.js 的条数。
   改了歌单 / 随笔 / 相册或想改建站日，只动那些数据文件 / START，不用碰 HTML。
   ============================================================ */
(function () {
  var START = "2026-10-08"; /* 建站日：YYYY-MM-DD */

  /* ---------- ① 在站天数 ---------- */
  var days = document.querySelector(".site-days");

  if (days) {
    function parseLocal(str) {
      var p = str.split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }

    var start = parseLocal(START);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    var diff = Math.floor((today - start) / 86400000);
    days.textContent = diff <= 0 ? "在站第 1 天" : "在站第 " + (diff + 1) + " 天";
  }

  /* ---------- ② 音乐首数 ---------- */
  var music = document.querySelector("[data-site-music]");

  if (music) {
    /* playlist.js 若没加载成功就保持占位符，不写一个错的 0 */
    if (Array.isArray(window.MUSIC_PLAYLIST)) {
      music.textContent = String(window.MUSIC_PLAYLIST.length);
    }
  }

  /* ---------- ③ 随笔篇数 ---------- */
  var essays = document.querySelector("[data-site-essays]");

  if (essays) {
    /* 同上：essays.js 没加载成功就不写 */
    if (Array.isArray(window.ESSAYS)) {
      essays.textContent = String(window.ESSAYS.length);
    }
  }

  /* ---------- ④ 照片张数 ---------- */
  var photos = document.querySelector("[data-site-photos]");

  if (photos) {
    /* 同上：album.js 没加载成功就不写 */
    if (Array.isArray(window.ALBUM)) {
      photos.textContent = String(window.ALBUM.length);
    }
  }
})();
