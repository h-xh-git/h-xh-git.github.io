/* ============================================================
   projects.js — 「项目」的唯一数据源
   想加一个项目，在这里补一个对象就行，页面（projects/index.html）自己会长。

   字段：
     title    项目名（必填）
     summary  一两句说明（选填）
     status   状态小字（选填）：在做 / 做完了 / 搁着了…
     date     日期（选填）：YYYY-MM-DD 或 YYYY-MM，只用来排序（新的在前）
              时间线上显示的是「2026.10.07」这种，由 date 生成；
              卡片底部的 meta 显示「2026.10 · 做完了」，由 date + status 拼出来
     period   时间跨度（选填）：写死的显示文字，例如 "2026.07–08"。
              填了它，时间线和卡片的日期位置就都显示这个（有起止区间的项目用）
     cover    封面图（选填）：路径从站点根目录写起，
              例如 "assets/img/projects/box.jpg"；留空就用占位块（大号标题 + 右上 ✳）
     link     外链（选填）：填了整张卡片可点，新窗口打开；不填就是一张不可点的卡

   （原来还有个 demo 示例字段：2026-10-09 那轮清理里，它和虚线「示例」标签一起撤掉了。）

   下面五条：
     01 掌上红白机 / 02 智能停车场 —— 简历「个人项目」两条；
     03 平衡滚球小车 —— 简历「校园经历」里 2026 年电赛那条（简历原文标题见 README）；
     04 双板 MP3 播放器 —— 来自本机工程目录 D:\DeepSeek Demo\Music\STM32-ESP32-MP3-Player
        （有独立 GitHub 仓库，所以填了 link，整张卡可点、右上角出箭头）；
        封面是那块 320×240 TFT 的界面图（原图本地留底 assets/img/originals/mp3-ui-mockup.png，不进仓库），
        按卡片槽位比例 2.2:1 裁过 —— 只留了歌名、歌手、歌词和进度条那一段。
     05 双核示波器 —— 来自本机工程目录 D:\DeepSeek Demo\DualCore-AudioHub\DualCore-Oscilloscope
        （独立 GitHub 仓库，公开 / GPL-3.0，所以也填了 link）；封面用仓库里的 ui_preview.png
        （tools/preview_ui.py 离线渲染出来的真实界面，原图本地留底 assets/img/originals/oscilloscope-ui-preview.png，不进仓库），
        按卡片槽位比例 2.2:1 裁成 960×436 —— 留了状态栏 + 波形区。
   date 的来源（2026-10-09 补）：
     03 平衡滚球小车 —— 简历「校园经历」原文就写「2026.07 – 2026.08」，所以填了
        date "2026-08"（排序用）+ period "2026.07–08"（显示用）。
     04 双板 MP3 播放器 —— GitHub 仓库 STM32-ESP32-MP3-Player 的创建日期 2026-10-07。
     05 双核示波器 —— 仓库 CHANGELOG 里 [0.1.0] — 2026-10-03，取首个版本发布那天。
     01 掌上红白机 / 02 智能停车场 —— 手头没有日期依据，留空，时间线上显示「日期待补」，
        有日期给我就补上（补上会自动插到正确位置，并按月倒序排）。

   排序：有 date 的按 date 倒序在前，没 date 的排在后面（保持数组顺序 01 → 02）。
   ============================================================ */

window.PROJECTS = [
  {
    title: "掌上红白机",
    summary: "用 ESP32-S3 自己做的一台掌机 —— 从 LM2596 双路电源、PCB 布局布线打样焊接到固件全流程自己来。移植 nofrendo 模拟器核心，跑通 6502 CPU、PPU 图像和 APU 音频，支持 40 多个卡带 mapper，还能连 WiFi 从网页传 ROM，免拆机换游戏。",
    status: "做完了"
  },
  {
    title: "智能停车场",
    summary: "以 STM32F407 为主控的停车场收费系统：RC522 射频读卡、MaixCAM 车牌识别、红外车辆检测、舵机道闸与 OLED 显示，自定义串口协议跟上位机双向同步，上位机用 Python(Tkinter) + SQLite 写成。",
    status: "做完了"
  },
  {
    title: "平衡滚球小车",
    date: "2026-08",
    period: "2026.07–08",
    summary: "2026 年电赛（广东赛区）H 题：四天三夜做一台能自动循迹、把钢球稳在横杆上的小车。我负责整车硬件 —— STM32 主控、TB6612 电机驱动、红外循迹阵列、舵机与图传模块的选型，PCB 焊接和整机调试全包，最后拿下广东省二等奖。",
    status: "做完了",
    cover: "assets/img/projects/ball-car.jpg"
  },
  {
    title: "双板 MP3 播放器",
    date: "2026-10-07",
    summary: "STM32F407 管界面、按键、TF 卡和歌单，ESP32-S3 管 MP3 软解、功放与 WiFi；两板之间一根 1 Mbps 串口传压缩流，再一条 SPI 让手机网页上传的歌直接写进卡里，全程裸机、没有 RTOS。屏上要显示 ID3 封面和滚动歌词，就自己写了迷你 JPEG 解码器和 lrc 解析；另有断点续播（片内 Flash 环形记录 + CRC16，掉电最多丢一秒）。",
    status: "做完了",
    cover: "assets/img/projects/mp3-player.png",
    link: "https://github.com/h-xh-git/STM32-ESP32-MP3-Player"
  },
  {
    title: "双核示波器",
    date: "2026-10-03",
    summary: "自己做的双通道数字存储示波器，思路是把工作切成两半：STM32F407 当实时核 —— 双 ADC 同步采样、TIM2 定时触发 + DMA、纯整数测量、TFT + OLED + 按键编码器，裸机无 RTOS、主循环零阻塞；ESP32-S3 当连接核 —— 内置网页示波器、拖动设触发电平、CSV 导出、网页配网写 NVS、mDNS、OTA。两核之间一根 460800 bps UART 走自制 CRC-8 帧协议，13 档采样率（100 Hz – 1 MSa/s），触发搜索窗按 10 ms 时间自适应。",
    status: "做完了",
    cover: "assets/img/projects/oscilloscope.png",
    link: "https://github.com/h-xh-git/DualCore-Oscilloscope"
  }
];
