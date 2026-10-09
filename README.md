# 夜坐所安的小屋

一个纯静态的个人博客：**没有后端、没有数据库、没有构建步骤**，双击 `index.html` 就能看。

- **线上**：<https://h-xh-git.github.io/> ｜ 仓库 `h-xh-git/h-xh-git.github.io`，GitHub Pages 从 `main` 分支根目录发布
- **形态**：手写 HTML / CSS / 原生 JS，零依赖、零构建，全站相对路径
- **改内容 = 改数据文件**：五个栏目的内容全在 `assets/data/*.js`，页面只负责渲染
- **下一步**：重写成前后端一体的博客，见文末「路线图」

## 目录

```
yezuo-blog/
├─ index.html                 首页（九张卡）
├─ essays/       index.html   随笔目录页 ｜ read.html 单篇页（?p=slug）
├─ collections/  index.html   收集（链接 / 书影音 / 足迹时间轴）
├─ photos/       index.html   相册（瀑布流）
├─ projects/     index.html   项目（时间线）
├─ friends/      index.html   友链（自适应网格）
└─ assets/
   ├─ css/   tokens · layout · components · page          令牌 / 外壳 / 组件 / 栏目页
   ├─ js/    clock calendar fit site player               首页各卡
   │         essays-page album-page projects-page friends-page
   │         collections-page collection-card review nav
   ├─ data/  essays album projects friends collections     ← 内容都在这里
   ├─ img/   profile home projects essays album friends trail originals
   └─ music/ playlist.js + *.mp3（mp3 不在仓库里）
```

## 往哪放东西

**图片** —— `assets/img/` 下一个用途一个文件夹，路径都从**站点根目录**写起：

| 文件夹 | 放什么 | 谁在读 |
| --- | --- | --- |
| `profile/` | 站点头像 | Hero 头像 |
| `home/` | 首页照片卡的图 | 照片卡 |
| `projects/` | 项目封面 | `projects.js` 的 `cover` |
| `essays/` | 随笔配图，文件名跟 `slug` 对齐 | `essays.js` 的 `image` |
| `album/<分类>/` | 相册照片，按四个分类分子目录 | `album.js` 的 `src` |
| `friends/` | 友链头像 | `friends.js` 的 `avatar` |
| `trail/` | 足迹照片 | `collections.js` 的 `image` |
| `originals/` | 原图留底（约 7 MB，**不在仓库里**） | 页面不读 |

**数据** —— 五个文件、五张表：

| 栏目 | 文件 | 必填 | 选填 |
| --- | --- | --- | --- |
| 随笔 | `data/essays.js` | `slug` `title` `date` `body` | `excerpt` `image` |
| 相册 | `data/album.js` | `src` `title` | `kind` `place` `date` `w` `h` |
| 收集 | `data/collections.js` | `kind` `title` | `source` `date` `note` `url` `image` |
| 项目 | `data/projects.js` | `title` | `summary` `status` `date` `period` `cover` `link` |
| 友链 | `data/friends.js` | `name` | `url` `intro` `avatar` `sign` |
| 歌单 | `music/playlist.js` | 文件名或完整地址 | —— |

**几句容易踩的：**

- **随笔**：`body` 是数组 —— 字符串是一段，`{ h: "小标题" }` 是小标题，`{ quote: "…" }` 是引用块；`date` 填的是「这篇写的是哪一天」，它同时决定目录排序、以及能不能上首页「最近写下的」（那张卡只取最近 3 篇）。
- **相册**：分类表在 `album.js` 顶部的 `ALBUM_KINDS`（花枝入梦来 / 悠悠行旅中 / 飞鸟倦归林 / 漫漫人物录），改文字、加分类都在那儿，页面那排标签自己跟着变；`w` / `h` 建议填（瀑布流靠它算高度，不填按 3:2 估）；长边 ≤1600px 就够，手机原图放进去也能显示，只是页面会变重。
- **收集**：`kind` 取 `link` / `book` / `film` / `music` / `place`；足迹的 `note` 是那天的备注。
- **项目**：填了 `link` 整张卡才可点、右上角才出现箭头；`date` 留空的排在最后、轴上写「日期待补」；封面按 **2.2:1** 裁好放进 `projects/`（窄屏的卡片槽位就是 2.2:1）。
- **友链**：没头像会自动用名称的第一个字 + 柔和底色轮换；填了 `url` 整张卡才可点。
- 原图丢进 `assets/img/originals/` 留底就行，网页用的压缩版另出。
- **数据清空都不会破版**：随笔 / 收集显示一行「还没写东西」「还没收东西」，相册收起照片墙留一块虚位，友链显示「还没加朋友」，项目留一句引导。

## 各页面在做什么

- **首页九张卡**：Hero / 照片卡 / 时钟（真实功能）· 项目卡 / 随笔卡 / 日历（真实功能）· 站点信息卡 / 最近收集 / 音乐播放器。站点信息卡的「N 首音乐 / N 篇随笔 / N 张照片」分别取自 `music/playlist.js`、`data/essays.js`、`data/album.js` 的长度，「在站第 N 天」由 `js/site.js` 从顶部的 `START` 算起；只剩「建站 / 最近更新」两个日期是写在 `index.html` 里的死数字，改内容时顺手改。
- **随笔**：目录页一行一篇（日期倒序、整行可点）；单篇页是 `read.html?p=slug`，底部自动接「更新的一篇 / 更早的一篇」，浏览器标签标题会跟着变；宽屏单篇是**左文右图**（照片贴右边跟着滚），窄屏变竖排。正文宽度限在 36em 左右。
- **相册**：桌面 4 列 → 3 / 2 / 1 列，第一张跨 2 列，其余落进当前最矮的一列；顶部分类胶囊（带张数）只显示有照片的分类；照片编号是它在**全部照片**里的序号，筛选也不换号；卡片高度是算出来的，刷新和切分类都不跳动。
- **收集**：三张并排的卡（链接 / 书影音 / 足迹时间轴），每张卡自己滚（卡头钉住、卡身 `overflow-y: auto`，长的足迹不会把页面拉长）；≥1080px 一行三张，700–1079px 前两张并排，<700px 竖排。
- **项目**：一行一个的时间线 —— 左边日期列、中间带节点的轴、右边卡片（封面撑满右半边、460px 封顶）；≤900px 日期列收起、轴挪到最左、卡片回到「封面在上、文字在下」。
- **友链**：`repeat(auto-fill, minmax(min(100%, 280px), 1fr))`，列数不用手写断点。

## 音乐

- 13 首 mp3 **只在本地**（`.gitignore` 排除了），所以线上会一首接一首打不开、最后显示「音乐暂时没上线」；本地双击照常能播。
- 加歌两步：mp3 放进 `assets/music/`，文件名补进 `music/playlist.js`（文件名要完全一致含扩展名；数组顺序 = 播放顺序）。
- 歌单里每条两种写法（`player.js` 的 `trackSrc()`）：只写文件名 → 自动去 `assets/music/` 取；写完整地址 → **原样使用** —— 以后换托管，只有这一处要改。
- 播放器全站可用：首页是大卡，别的页面只在「这一会儿确实在放歌」时才出现右下角迷你条；换页靠 `sessionStorage` 交接（第几首 / 播到几秒 / 是否在放），浏览器拦下自动播放时点页面任意地方就接上，30 秒没动静的会话不再续播。
- 那 116 MB 商业歌曲将来放哪，三条路，定下来只有歌单那一处要改：

| 方案 | 音频放哪 | 挡不住什么 |
| --- | --- | --- |
| 对象存储 + Referer 白名单 | R2 / 七牛 / COS，只允许 `h-xh-git.github.io` | 拿到直链的人仍能下载 |
| Release 附件 | 站点仓库的 Releases | 同样公开，音乐和站点绑在一起 |
| 独立公开音乐仓库 | 另开公开仓库 + jsDelivr 直链 | 地址公开，但和站点隔离 |

> 私人库不行（匿名请求 404，塞 token 等于公开）；`base64` 内嵌也不行（122.6 MB → 163.5 MB，失去流式播放，且没有改变公开性）。

## 本地预览 / 部署

- **双击 `index.html`（推荐）**：全站相对路径，换文件夹、换盘符都不会失效，音乐也能正常拖进度条。
- 本地服务器：站点根目录执行 `python -m http.server 8899 --bind 127.0.0.1`，浏览器开 `http://127.0.0.1:8899`。注意这类简易服务器**不支持 Range**，表现是「音乐能播、进度条拖不动」。
- **发布**（推完一两分钟 Pages 重建，构建状态看仓库 Actions 页的 `pages-build-deployment`）：

```
cd D:\boke_demo\yezuo-blog
git add -A
git commit -m "更新了什么"
git push
```

- 根目录那个空文件 `.nojekyll` 是告诉 Pages 别走 Jekyll，**别删**。
- 仓库里没有的东西：`assets/music/*.mp3`、`assets/img/originals/`、`_dev/`、`_tmp*`、`*.bak`、`*说明.txt`。免费账号的 Pages 只能从公开仓库发布，所以「仓库里看不到 mp3」只能在音频来源那一层做。

## 评论（giscus）

首页「站点信息卡」那颗「访问与评价」打开弹窗，里面是 giscus —— 评论存在**你自己仓库的 GitHub Discussions** 里，访客用**自己的**账号登录留言，站点里不放任何 token（静态站塞 token 等于把写权限公开）。

**已接线（2026-10-09）**：Discussions 已开、giscus App 已装到本仓库，四个值写在 `assets/js/review.js` 顶部的 `CONFIG`：

| giscus 字段 | 值 |
| --- | --- |
| `data-repo` | `h-xh-git/h-xh-git.github.io` |
| `data-repo-id` | `R_kgDOUrFj_w` |
| `data-category` | `Announcements` |
| `data-category-id` | `DIC_kwDOUrFj_84DHX_L` |

- 映射 `data-mapping="pathname"`：每篇文章各自一个讨论帖，留言不会串页。换仓库、换分类时四个值一起改（新值在 <https://giscus.app/zh-CN> 填仓库名后生成）。
- 脚本是**第一次点开按钮时才注入**的，别改成页面加载就引 giscus；弹窗只放在首页（想放别处，加一份同样的 DOM + 引 `review.js` 即可）。
- 本地 `file://` 下弹窗不会出评论区，只显示一句说明 —— giscus 要站点在 http(s) 上才连得上 GitHub。
- 四个值缺一个，弹窗退回「评论区还在接线中」+ 邮箱 / GitHub 兜底入口，不会白屏。
- 第一次有人留言时 giscus 才创建讨论帖；在那之前 Discussions 里看不到，属正常。

## 路线图：服务器版（前后端完整开发）

把「静态页 + 手写数据文件」重写成前后端一体的博客：内容在后台里写，前端保留现在的视觉与信息结构。

- **前端**：沿用现有页面与 CSS，`assets/js/*-page.js` 的渲染逻辑可以整段搬过来；数据来源从 `window.XXX` 换成 `GET /api/projects` 这类接口；**字段契约尽量不动**（见上面的表），现有数据能直接导入；接口失败保留现在的空态文案，不白屏。
- **后端**：五张表的 CRUD + 单用户登录（只有自己能写）；图片上传时服务端压缩（长边 ≤1600px、首页 16:9 缩略图、项目封面 2.2:1）；音频直传对象存储返回直链（播放器已支持完整地址）；评论自建或继续用 giscus；访问统计落在自己库里，不引第三方。
- **选型（偏轻）**：单体 Node（Fastify / Hono）+ SQLite，或 NestJS + Postgres；图与音频放对象存储，服务器只存元数据；一台小服务器 + Docker + Caddy/Nginx；现有 `assets/data/*.js` 当初始数据导入一次。
- **顺序**：① 立骨架（登录 + 一个栏目，建议随笔）→ ② 补齐五个栏目 CRUD 与图片上传 → ③ 前端逐页切到 API（静态版继续留在 GitHub Pages 当备份）→ ④ 最后接音频、评论、统计。

## 已知问题 / 待办

**站点**

- 桌面窗口很矮时（视口高度约 740px 以下），第一行的 Hero 卡和时钟卡内容会被压到溢出；第三行那三张卡早按容器高度做了降级，第一行还没做。
- 音乐没上线（见「音乐」）。
- 首页 Hero 那两个占位按钮（`data-pending="个人介绍"` / `"素材说明"`）还没接内容，只弹提示。

**内容（等你给）**

- 随笔 4 篇 =《花语》（你的原文）+ 3 篇占位（标题摘要沿用早期原话，正文是我重写的）；相册 3 张是占位（`D:\相册\花枝入梦来\` 里还有 11 张没导入，「漫漫人物录」还空着）；收集 10 条里部分字段是代写的；友链 0 位。
- 几处文案是我代写的，换成你自己的话更合适：Hero 简介、页脚寄语、随笔目录副标题、相册副标题、照片卡标题。
- 项目 01 掌上红白机 / 02 智能停车场 没有 `date` 也没有封面。

## 改样式前先看这几条

- `.nojekyll`、`.review-modal[hidden] { display: none }`、`.collect-deck .collect-section[hidden] { display: none }` 这几条**别删** —— 后两条靠它压住 `display: flex`，删了「没数据的卡」「该藏的弹窗」会又冒出来。
- 项目页的 `.project-card` / `.project-cover` 跟**首页那张项目卡重名**（`layout.css` / `components.css` 里也有一份），所以那一节规则全挂在 `.project-list` 底下：别丢前缀，也别删 `.project-list .project-card` 里的 `height: auto`。
- `.hero-actions` 的 `margin-bottom: 22px` 是专门用来避开右下角那行绝对定位文字的，别顺手删。
- 断点只用 `min-width` 往上加，别写 `max-width` 的上界（分栏宽度会算出 999.33px 这类小数，两种断点同时落空就会裂出一条缝）。
- 站头「聊聊」、Hero 邮箱按钮、页脚三处的地址都是完整网址（`mailto:` / `https://`），换邮箱或换 GitHub 号时把这七个页面 + 首页 Hero 一起搜一遍。

---

设计规格（布局尺寸、断点、主题令牌等）在 `D:\cursor\momo-blog-main\momo-blog-main\momo-blog-layout-spec.html`。
