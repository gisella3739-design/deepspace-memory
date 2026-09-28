# ✦ 深空记忆 · Deepspace Memory

一个私人朋友圈风格的小站，灵感来自朋友们亲手写的 [taiwan_memory](https://github.com/jia050904/taiwan_memory)——那是一个"我们自己小型朋友圈"。这一版换上《恋与深空》主题色（深空蓝紫 × 星尘金），首页常驻一位夏以昼。

> 引力的尽头，是你回望的地方。

## ✦ 功能

- **DIARY**：发文字 + 最多 9 张照片（自动压缩）+ 评论，分页加载，照片点开看大图
- **LINKS**：攻略/吃/玩/周边 收藏夹，贴链接一键收藏，按分类筛选
- **GUIDES**：导入 .docx Word 攻略，直接在网页里预览（docx-preview 渲染）
- **HOME**：留言板、随手记 Memo（最多 30 条）、BGM 播放器、夏以昼语录轮播
- 全站数据存在**你自己浏览器的 localStorage**，不需要服务器、不需要数据库

## ✦ 技术栈

纯 HTML + CSS + 原生 JavaScript，零构建、零依赖安装。仅两个 CDN 库：

- [docx-preview](https://github.com/VolodymyrBaydalka/docxjs)（Word 预览）
- [JSZip](https://stuk.github.io/jszip/)（docx 解包）

## ✦ 本地跑起来

任何静态服务器都行，比如：

```bash
# Python
python3 -m http.server 4173

# 或 Node
npx serve .
```

打开 http://localhost:4173 即可。直接双击 index.html 也能用（file:// 下 docx 预览的 CDN 依赖需要网络）。

## ✦ 加自己的 BGM

1. 把 mp3 放进 `songs/` 文件夹
2. 编辑 `songs/manifest.json`：

```json
[
  { "title": "歌名一", "file": "your-song-1.mp3" },
  { "title": "歌名二", "file": "your-song-2.mp3" }
]
```

⚠️ 注意音乐版权：不要上传受版权保护的音频到公开仓库，自己听就好。

## ✦ 部署上线

### 方式一：GitHub Pages（最简单，推荐作品集用）

1. 把本项目 push 到你的 GitHub 仓库（见下方「上传到 GitHub」）
2. 仓库页面 → **Settings** → 左侧 **Pages**
3. **Source** 选 `Deploy from a branch`，Branch 选 `main` / 目录 `/ (root)` → **Save**
4. 一两分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`

### 方式二：Render / Netlify / Vercel（免费托管）

以 Render 为例：

1. push 到 GitHub 后，在 [render.com](https://render.com) → **New +** → **Static Site**
2. 连接你的 GitHub 仓库，Build Command 留空，Publish Directory 填 `.`（或 `/`）
3. 部署完成后得到 `https://xxx.onrender.com` 形式的地址

Netlify / Vercel 更快：官网导入 GitHub 仓库 → 全部默认 → Deploy。

### 方式三：想加后端/真数据库（进阶）

当前版本数据在浏览器本地，换设备/清缓存就没了。想做成原版 taiwan_memory 那样多设备共享：

- 参考 [taiwan_memory 的做法](https://github.com/jia050904/taiwan_memory)：Firestore 存数据（links / posts / guideDocs / memos / guestbook 五个 collection）、Cloudinary 存图片、Render 部署
- 或者加一个极简 Node server（把 localStorage 换成 REST API + JSON 文件/SQLite）

## ✦ 上传到 GitHub

```bash
cd deepspace-memory
git init
git add .
git commit -m "✦ init: deepspace memory"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

## ✦ 数据说明

- 日记 / 收藏 / 留言 / memo / 攻略列表 → `localStorage`（键前缀 `dsm_`）
- 日记照片会被压缩成 JPEG（最长边 1080px）再存，避免撑爆 5MB 配额
- **换浏览器或清缓存 = 数据清空**；想备份可以在浏览器控制台执行：

```js
copy(JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k]) => k.startsWith("dsm_")))))
```

## ✦ 致谢与声明

- 结构与玩法灵感：[taiwan_memory](https://github.com/jia050904/taiwan_memory)（yukiri & jia's little web），感谢这份可爱又硬核的参考
- 《恋与深空》及角色名称、形象版权归叠纸游戏所有；本项目为个人兴趣向的风格致敬，不含任何官方美术素材
- Star 图标、夏以昼像素头像均为本项目手绘 SVG
