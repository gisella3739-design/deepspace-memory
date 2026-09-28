# ✦ 深空记忆 · 项目笔记

> 2026-09-23 · vibecoding 作品集项目
> 一句话：借鉴 taiwan_memory 的"私人小朋友圈"玩法，换上恋与深空主题，纯前端零成本小站。

## 1. 项目缘起

小红书看到 @优雅猪肘 的 taiwan_memory（起点是整理台湾旅游攻略，最后长成私人朋友圈），顺手把源码仓库完整读了一遍：功能结构 = HOME / DIARY / TRAVEL / DANCE / GUIDES，生产栈 = Firestore + Cloudinary + Render，本地兜底 = 零依赖 Node server。这一版照它的功能骨架重写，主题换成《恋与深空》，加了夏以昼常驻位，并砍掉后端——数据全存浏览器，部署零成本。

## 2. 技术栈

- **前端**：单页 HTML + CSS + 原生 JS，无框架无构建
- **CDN 库（仅 2 个）**：docx-preview（Word 预览）、JSZip（docx 解包）
- **存储**：localStorage（键前缀 `dsm_`），照片压缩成 JPEG（最长边 1080px）再存 base64
- **部署**：GitHub Pages（首选）/ Render / Netlify，全部免费

## 3. 目录结构

```
deepspace-memory/
├── index.html          # 单页骨架（HOME/DIARY/LINKS/GUIDES 四个 section）
├── css/style.css       # 主题样式（深空蓝紫 × 星尘金 + 星空动画）
├── js/app.js           # 全部逻辑（导航/日记/收藏/留言/memo/BGM/docx）
├── docs/
│   ├── REQUIREMENTS.md # 需求文档（P0/P1/P2 + 数据模型 + 验收标准）
│   └── PROJECT_NOTES.md# 本文件
├── songs/manifest.json # BGM 曲目清单（放 mp3 后编辑它）
├── README.md           # 使用说明 + 三种部署方式
└── .gitignore
```

## 4. 核心实现要点

- **路由**：`data-nav` 属性驱动的 section 切换，`goto()` 一把梭，无 hash 路由（保持零依赖）
- **图片压缩**：FileReader → Image → canvas 缩放（max 1080px）→ `toDataURL("image/jpeg", .75)`，避免 base64 撑爆 5MB localStorage 配额
- **配额兜底**：`store.set` 包 try-catch，存满时 alert 提示删旧日记而不是静默失败
- **docx 预览**：`docx.renderAsync(buf, container)` 一行渲染；只存导入记录（文件名+时间），不存渲染后 HTML（太大）
- **BGM**：`songs/manifest.json` 列曲目（GitHub Pages 没有目录列表接口，约定清单文件最稳）；空清单时显示引导文案
- **XSS 防护**：所有用户输入经 `esc()` 转义后再插入 innerHTML
- **星空背景**：90 颗随机位置/大小的 star div + CSS twinkle 动画，`pointer-events:none` 不挡交互

## 5. 已知限制

- 换浏览器 / 清缓存 = 数据清空（备份方法见 README）
- GUIDES 只记录导入历史，重开需重新选文件
- 贴链接不能自动抓标题封面（需后端，P2 再做）
- 评论者固定显示「✦」，没有访客署名体系

## 6. 时间线

- 2026-09-23：读完 taiwan_memory 源码 → 定 PRD → 全量重写 → 无头浏览器实测（五个模块交互全通过、无 JS 报错）→ 打包交付
- 下一步：push GitHub → 开 Pages → 挂作品集；P2 需要多设备共享时接 Firestore

## 7. 相关链接

- 灵感来源：https://github.com/jia050904/taiwan_memory （[小红书笔记](https://xhslink.cn/o/2CfeXK7fhex)）
- 原版线上站：https://taiwan-memory.onrender.com/
