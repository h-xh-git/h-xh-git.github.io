/* ============================================================
   album.js — 「相册」的唯一数据源
   照片放 assets/img/album/<分类>/（见下面 ALBUM_KINDS 的 key），然后在这里加一条。

   字段：
     src    图片路径（必填）：从站点根目录写起，
            例如 "assets/img/album/flower/2026-10-shuilian.jpg"
     title  标题（必填）
     kind   分类（选填，但建议填）：取值范围见下面的 ALBUM_KINDS，
            填了才能在相册顶部的分类标签页里筛出来；
            不填（或填了表里没有的值）会归到「其他」
     place  地点（选填）：信息条上的小字
     date   日期（选填）：YYYY-MM-DD，相册按它倒序排
     w / h  图片像素宽高（选填，但建议填）：
            瀑布流靠它算卡片高度，不填就按 3:2 估，排出来会松紧不匀。
            填的时候直接用文件属性的宽高就行，不用算比例。

   排布规则（照设计规格）：默认 4 列 → 窄了变 3 / 2 / 1 列；
   第一张跨 2 列（列数 ≤2 时跨满），其余依次放进当前最矮的那一列。
   ============================================================ */

/* 分类清单：改标签文字 / 加分类都在这。
   顺序 = 相册顶部标签页的顺序，只显示「有照片的分类」。 */
window.ALBUM_KINDS = [
  { key: "flower",  label: "花枝入梦来" },
  { key: "journey", label: "悠悠行旅中" },
  { key: "bird",    label: "飞鸟倦归林" },
  { key: "people",  label: "漫漫人物录" }
];

/* 现在这三条是占位照片：图是从站点原来那三张现成照片（photo-01/02/03.jpg）
   挪进各分类文件夹的，标题、地点、日期都是代写的 —— 等你的真照片替换。
   顶部分类标签只显示「有照片的分类」。 */
window.ALBUM = [
  {
    src: "assets/img/album/flower/water-lily.jpg",
    title: "睡莲",
    kind: "flower",
    place: "广州",
    date: "2026-10-05",
    w: 1600,
    h: 1062
  },
  {
    src: "assets/img/album/journey/sea-boat.jpg",
    title: "海边的船",
    kind: "journey",
    place: "广州",
    date: "2026-09-21",
    w: 1400,
    h: 788
  },
  {
    src: "assets/img/album/bird/bougainvillea.jpg",
    title: "三角梅",
    kind: "bird",
    place: "广州",
    date: "2026-09-07",
    w: 1100,
    h: 994
  }
];
