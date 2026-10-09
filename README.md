# 夜坐所安的小屋

一个纯静态的个人博客。手写 HTML / CSS / 原生 JS，**没有框架、没有构建步骤、没有后端**，双击 `index.html` 就能看。

线上：<https://h-xh-git.github.io/>

## 它是什么

一个广州夜晚气质的小站：收着一些照片、随笔、喜欢的音乐，和一份工程师的作品清单。所有内容都在版本库里，改内容就是改几个 `.js` 数据文件，页面只负责渲染。

## 页面

| 页面 | 地址 | 内容 |
| --- | --- | --- |
| 首页 | `index.html` | 九张卡（见下） |
| 随笔 | `essays/` | 目录页一行一篇；单篇 `read.html?p=slug`，宽屏左文右图，底部自动接前后篇 |
| 相册 | `photos/` | 瀑布流照片墙，第一张跨 2 列，顶部按分类筛选 |
| 收集 | `collections/` | 三张并排的卡 —— 链接 / 书影音 / 足迹时间轴，各自独立滚动 |
| 项目 | `projects/` | 一行一个的时间线：日期列 + 带节点的轴 + 卡片，封面撑满右半边 |
| 友链 | `friends/` | 自适应网格，没头像就用名字的第一个字 |

首页九张卡分三行：

- **第一行**：Hero（头像 + 站名 + GitHub / 邮箱按钮）· 照片卡 · 时钟（按广州时区真实走时）
- **第二行**：项目卡 · 随笔卡（取最近 3 篇）· 日历（可翻月、今天高亮）
- **第三行**：站点信息卡（音乐 / 照片 / 随笔的条数自动统计，加在站天数）· 最近收集 · 音乐播放器

## 特点

- **零依赖**：没有 npm、没有打包器、没有 CDN 依赖。全站相对路径，换目录、换域名都不会失效。
- **内容与视图分离**：五个栏目的数据都在 `assets/data/*.js`，页面只读它渲染 —— 加一篇随笔、一张照片、一个项目，都只改数据文件。
- **全站音乐播放器**：换页不断歌 —— 播放状态写进 `sessionStorage`，翻页接着放；没有播放器大卡的页面只在真正放歌时才冒出右下角迷你条。
- **评论存在自己的仓库里**：首页「访问与评价」用 giscus，留言落进本仓库的 GitHub Discussions，访客用**自己的** GitHub 账号登录，站点里不放任何 token。这也是全站唯一会请求的外部脚本，而且是点开弹窗才加载。
- **空数据不破版**：任何栏目清空数据，页面退化成一句引导或一块占位，不会白屏。
- **CSS 分四层**：`tokens`（颜色 / 字号 / 间距）/ `layout`（外壳与九宫格）/ `components`（卡片组件）/ `page`（栏目页）；断点只用 `min-width` 往上加。

## 目录

```
yezuo-blog/
├─ index.html                  首页（九张卡）
├─ essays/  collections/  photos/  projects/  friends/      五个栏目页
└─ assets/
   ├─ css/   tokens · layout · components · page
   ├─ js/    按卡与栏目分文件（clock calendar player site … · *-page.js · review.js）
   ├─ data/  essays album projects friends collections
   ├─ img/   profile home projects essays album friends trail originals
   └─ music/ playlist.js + *.mp3（mp3 不在仓库里）
```

## 本地运行

- **直接双击 `index.html`（推荐）**：全站相对路径，换文件夹、换盘符都不会失效，音乐也能正常拖进度条。
- 或在站点根目录起一个静态服务器：

  ```
  python -m http.server 8899 --bind 127.0.0.1
  ```

  然后开 `http://127.0.0.1:8899`。这类简易服务器**不支持 Range 请求**，表现是「音乐能播、进度条拖不动」。

## 部署

GitHub Pages 用户站：仓库 `h-xh-git/h-xh-git.github.io`，从 `main` 分支根目录发布；根目录的空文件 `.nojekyll` 用来跳过 Jekyll。

```
git add -A
git commit -m "更新了什么"
git push
```

推完一两分钟 Pages 重建，构建状态在仓库的 Actions 页（`pages-build-deployment`）。

## 内容放在哪

- **数据**：`assets/data/` 五个文件（essays / album / collections / projects / friends），歌单在 `assets/music/playlist.js`
- **图片**：`assets/img/` 按用途分文件夹（profile / home / projects / essays / album / friends / trail），`originals/` 放原图留底
- **音频不在仓库里**：`.gitignore` 排除了 mp3，所以线上播放器会平静地降级成「音乐暂时没上线」，本地双击照常能播；歌单里把条目写成完整地址，就能切到对象存储等外部托管

## 下一步

重写成前后端一体的博客：内容在后台里写，前端保留现在的视觉与信息结构 —— 沿用现有页面与 CSS（`*-page.js` 的渲染逻辑可以整段搬），数据来源从 `window.XXX` 换成 API，字段契约不变，现有数据可直接导入。

---

设计规格（布局尺寸、断点、主题令牌等）在 `D:\cursor\momo-blog-main\momo-blog-main\momo-blog-layout-spec.html`。
