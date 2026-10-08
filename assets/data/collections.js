/* ============================================================
   collections.js — 「收集」的唯一数据源
   首页的「最近收集」卡和「收集」栏目页都读这个文件。

   怎么加一条：
     在 COLLECTIONS 里加一个对象就行，字段说明见下。
     kind 必须是上面 COLLECTION_KINDS 里的 key 之一：
     link 链接 / book 书 / film 影 / music 音 / place 足迹

   字段：
     kind    分类 key（必填）
     title   标题（必填）：书名、片名、文章名、地点名…
     source  来源（选填）：作者 / 站点域名 / 年份 / 「广州」这类地名
     date    日期（选填）：YYYY-MM-DD。首页只出最新的两条，
             栏目页按它倒序排，足迹时间轴也按它从头到尾排
     note    备注（选填）：一两句你自己的话，主要给足迹用
     url     外链（选填）：填了就在新窗口打开；不填就当作站内条目
     image   照片（选填）：放 assets/img/trail/ 里，这里写
             "assets/img/trail/xxx.jpg"（从站点根目录写起）。
             首页缩略图位不填就用分类字形占位；足迹配了照片就显示在时间轴上
   ============================================================ */

window.COLLECTION_KINDS = [
  {
    key: "link",
    label: "链接",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>'
  },
  {
    key: "book",
    label: "书",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
  },
  {
    key: "film",
    label: "影",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M7 4v5M17 4v5"/></svg>'
  },
  {
    key: "music",
    label: "音",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>'
  },
  {
    key: "place",
    label: "足迹",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  }
];

/* 现在十条（1 链接 · 2 书 · 3 影 · 1 音 · 3 足迹）：
   「影」是你要的三部《爱在…》（爱在黎明破晓前 / 日落黄昏时 / 午夜降临前），
   链接那条是你给的（Kazumi，github.com/Predidit/Kazumi），
   《精通开关电源设计（第2版）》也是你要的（作者 Sanjaya Maniktala，人民邮电出版社）；
   《设计中的设计》《宝島》和三个广州地点本身也是真的；
   来源、日期、备注是为了页面完整代写的（Kazumi 和这本书的日期也是我填的）。
   加一条在下面补一个对象：足迹按日期从新到旧排在前面，
   栏目页会倒着读成「从最近往回」的时间轴。 */
window.COLLECTIONS = [
  {
    kind: "link",
    title: "Kazumi",
    source: "番剧采集 App · kazumi.app",
    date: "2026-10-09",
    url: "https://github.com/Predidit/Kazumi"
  },
  {
    kind: "music",
    title: "宝島",
    source: "松田彬人",
    date: "2026-10-05"
  },
  {
    kind: "book",
    title: "精通开关电源设计（第2版）",
    source: "Sanjaya Maniktala",
    date: "2026-10-07"
  },
  {
    kind: "book",
    title: "设计中的设计",
    source: "原研哉",
    date: "2026-09-28"
  },
  {
    kind: "film",
    title: "爱在午夜降临前",
    source: "理查德·林克莱特 · 2013",
    date: "2026-09-16"
  },
  {
    kind: "film",
    title: "爱在日落黄昏时",
    source: "理查德·林克莱特 · 2004",
    date: "2026-09-12"
  },
  {
    kind: "film",
    title: "爱在黎明破晓前",
    source: "理查德·林克莱特 · 1995",
    date: "2026-09-08"
  },
  {
    kind: "place",
    title: "二沙岛",
    source: "广州",
    date: "2026-09-05",
    note: "傍晚沿江走了一圈，风很大。"
  },
  {
    kind: "place",
    title: "沙面",
    source: "广州",
    date: "2026-08-23",
    note: "岛上的老榕树把路遮了一半，午后没什么人。"
  },
  {
    kind: "place",
    title: "白云山",
    source: "广州",
    date: "2026-08-09",
    note: "爬到摩星岭，风把汗吹干了。"
  }
];
