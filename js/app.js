/* ===== 深空记忆 · app.js =====
   数据全部存 localStorage（键前缀 dsm_），不依赖任何后端。
   日记照片压缩成 base64 存本地；Word 攻略用 docx-preview 渲染。
*/
"use strict";

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("dsm_" + k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem("dsm_" + k, JSON.stringify(v)); },
};
const fmtTime = ts => {
  const d = new Date(ts), p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ============ 导航 ============ */
function goto(name) {
  $$(".page").forEach(p => p.classList.remove("active"));
  $("#page-" + name)?.classList.add("active");
  $$(".nav a").forEach(a => a.classList.toggle("active", a.dataset.nav === name));
  window.scrollTo({ top: 0 });
}
$$("[data-nav]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); goto(a.dataset.nav); }));
$$("[data-goto]").forEach(b => b.addEventListener("click", () => goto(b.dataset.goto)));
$("#aboutBtn").addEventListener("click", () => $("#aboutDialog").showModal());

/* ============ 星空 ============ */
(function stars() {
  const box = $("#starfield"), frag = document.createDocumentFragment();
  for (let i = 0; i < 90; i++) {
    const s = document.createElement("i");
    s.className = "star" + (Math.random() < .15 ? " big" : "");
    const size = Math.random() < .15 ? 3 : 1 + Math.random() * 1.5;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-delay:${Math.random() * 3}s`;
    frag.appendChild(s);
  }
  box.appendChild(frag);
})();

/* ============ 夏以昼语录 ============ */
const QUOTES = [
  "“我是你的引力，也是你的降落伞。”",
  "“抬头看看，星星都在替我守着你。”",
  "“今天的航线：从我这儿，到You心里。”",
  "“别怕迷航，我永远在你能降落的 coordinate 上。”",
  "“苹果要吃，饭要按时吃，我也会一直都在。”",
  "“每一次失重，都朝着你的方向。”",
];
$("#xiaQuoteBtn").addEventListener("click", () => {
  $("#xiaQuote").textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
});

/* ============ 留言板 ============ */
function renderGuestbook() {
  const list = store.get("guestbook", []).slice(0, 6);
  $("#guestbookList").innerHTML = list.length
    ? list.map(m => `<li><span class="who">${esc(m.name)}</span>：${esc(m.msg)}<span class="when">${m.ts}</span></li>`).join("")
    : `<li class="muted">还没有留言，来当第一个吧 ✧</li>`;
}
$("#guestbookForm").addEventListener("submit", e => {
  e.preventDefault();
  const list = store.get("guestbook", []);
  list.unshift({ name: $("#guestName").value.trim() || "匿名小星星", msg: $("#guestMsg").value.trim(), ts: fmtTime(Date.now()) });
  store.set("guestbook", list.slice(0, 50));
  e.target.reset(); renderGuestbook();
});
function esc(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

/* ============ Memo ============ */
function renderMemos() {
  const list = store.get("memos", []).slice(0, 30);
  $("#memoList").innerHTML = list.length
    ? list.map(m => `<li><span>${esc(m.text)}</span><button class="del-btn" data-memo="${m.id}">✕</button></li>`).join("")
    : `<li class="muted" style="border:none">暂无随手记</li>`;
}
$("#memoForm").addEventListener("submit", e => {
  e.preventDefault();
  const list = store.get("memos", []);
  list.unshift({ id: uid(), text: $("#memoInput").value.trim() });
  store.set("memos", list.slice(0, 30));
  e.target.reset(); renderMemos();
});
$("#memoList").addEventListener("click", e => {
  const id = e.target.dataset.memo;
  if (id) { store.set("memos", store.get("memos", []).filter(m => m.id !== id)); renderMemos(); }
});

/* ============ BGM（读 songs/ 目录；GitHub Pages 静态托管没有目录列表接口，
              所以按约定 songs/manifest.json 列出曲目，见 README） ============ */
const bgm = { list: [], idx: 0 };
async function initBGM() {
  try {
    const r = await fetch("songs/manifest.json");
    bgm.list = r.ok ? await r.json() : [];
  } catch { bgm.list = []; }
  if (!bgm.list.length) { $("#bgmTitle").textContent = "把 mp3 放进 songs/ 并更新 manifest.json 就能播放 ♪"; return; }
  loadTrack(0);
}
function loadTrack(i) {
  bgm.idx = (i + bgm.list.length) % bgm.list.length;
  $("#bgmAudio").src = "songs/" + bgm.list[bgm.idx].file;
  $("#bgmTitle").textContent = "♪ " + bgm.list[bgm.idx].title;
}
$("#bgmToggle").addEventListener("click", () => {
  const a = $("#bgmAudio");
  if (!bgm.list.length) return;
  if (a.paused) { a.play(); $("#bgmToggle").textContent = "⏸"; }
  else { a.pause(); $("#bgmToggle").textContent = "▶"; }
});
$("#bgmPrev").addEventListener("click", () => bgm.list.length && (loadTrack(bgm.idx - 1), $("#bgmAudio").play(), $("#bgmToggle").textContent = "⏸"));
$("#bgmNext").addEventListener("click", () => bgm.list.length && (loadTrack(bgm.idx + 1), $("#bgmAudio").play(), $("#bgmToggle").textContent = "⏸"));

/* ============ DIARY ============ */
let pendingPhotos = [];
const MAX_PHOTOS = 9;

$("#diaryPhotos").addEventListener("change", e => {
  pendingPhotos = [];
  const files = [...e.target.files].slice(0, MAX_PHOTOS);
  $("#photoCount").textContent = `${files.length}/${MAX_PHOTOS}`;
  const preview = $("#photoPreview"); preview.innerHTML = "";
  files.forEach(f => {
    compressImage(f, 1080, 0.75).then(dataUrl => {
      pendingPhotos.push(dataUrl);
      const img = new Image(); img.src = dataUrl; preview.appendChild(img);
    });
  });
});

function compressImage(file, maxSide, quality) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

$("#diaryForm").addEventListener("submit", async e => {
  e.preventDefault();
  const text = $("#diaryText").value.trim();
  if (!text && !pendingPhotos.length) return;
  const bar = $("#diaryProgressBar"), wrap = $("#diaryProgress");
  wrap.classList.remove("hidden"); bar.style.width = "30%";
  await new Promise(r => setTimeout(r, 150)); // 让进度条可见
  const list = store.get("posts", []);
  list.unshift({ id: uid(), text, photos: pendingPhotos, ts: fmtTime(Date.now()), comments: [] });
  try { store.set("posts", list); }
  catch { alert("浏览器本地存储满了，试试删掉几条带很多图的旧日记～"); wrap.classList.add("hidden"); return; }
  bar.style.width = "100%";
  setTimeout(() => { wrap.classList.add("hidden"); bar.style.width = "0"; }, 400);
  e.target.reset(); pendingPhotos = [];
  $("#photoPreview").innerHTML = ""; $("#photoCount").textContent = `0/${MAX_PHOTOS}`;
  diaryPage = 0; renderDiary();
});

let diaryPage = 0;
const PAGE_SIZE = 3;
function renderDiary() {
  const list = store.get("posts", []);
  const shown = list.slice(0, (diaryPage + 1) * PAGE_SIZE);
  $("#diaryList").innerHTML = shown.length ? shown.map(postHTML).join("")
    : `<div class="card muted" style="text-align:center">还没有日记，写下第一篇吧 ✦</div>`;
  $("#diaryMore").classList.toggle("hidden", shown.length >= list.length);
}
function postHTML(p) {
  const photos = p.photos?.length
    ? `<div class="post-photos">${p.photos.map(src => `<img src="${src}" data-lightbox loading="lazy" alt="照片">`).join("")}</div>` : "";
  const comments = p.comments.map(c => `<div class="cm"><b>${esc(c.name)}</b>：${esc(c.text)}</div>`).join("");
  return `<div class="card post" data-post="${p.id}">
    <div class="post-head"><span class="post-who">✦ 我</span><span class="post-when">${p.ts}</span>
      <button class="del-btn" data-del-post style="margin-left:auto">删除</button></div>
    <div class="post-text">${esc(p.text)}</div>${photos}
    <div class="post-comments">${comments}
      <form class="cm-form"><input type="text" placeholder="评论一下…" maxlength="100" required>
        <button class="btn-ghost" type="submit">回复 ♡</button></form></div>
  </div>`;
}
$("#diaryMore").addEventListener("click", () => { diaryPage++; renderDiary(); });
$("#diaryList").addEventListener("click", e => {
  const card = e.target.closest(".post"); if (!card) return;
  const id = card.dataset.post;
  if (e.target.dataset.lightbox !== undefined) {
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.innerHTML = `<img src="${e.target.src}">`;
    lb.addEventListener("click", () => lb.remove());
    document.body.appendChild(lb); return;
  }
  if (e.target.closest("[data-del-post]")) {
    if (!confirm("删除这条日记？")) return;
    store.set("posts", store.get("posts", []).filter(p => p.id !== id));
    renderDiary(); return;
  }
});
$("#diaryList").addEventListener("submit", e => {
  e.preventDefault();
  const card = e.target.closest(".post"); if (!card) return;
  const input = e.target.querySelector("input");
  const list = store.get("posts", []);
  const post = list.find(p => p.id === card.dataset.post);
  if (post && input.value.trim()) {
    post.comments.push({ name: "✦", text: input.value.trim() });
    store.set("posts", list); renderDiary();
    const again = $(`.post[data-post="${post.id}"] .cm-form input`);
    again?.focus();
  }
});

/* ============ LINKS ============ */
let linkCat = "全部";
const CATS = ["全部", "攻略", "吃", "玩", "周边", "其他"];
function renderLinkChips() {
  $("#linkFilter").innerHTML = CATS.map(c =>
    `<span class="chip ${c === linkCat ? "active" : ""}" data-cat="${c}">${c}</span>`).join("");
}
function renderLinks() {
  const list = store.get("links", []).filter(l => linkCat === "全部" || l.cat === linkCat);
  $("#linkList").innerHTML = list.length ? list.map(l =>
    `<a class="link-card" href="${esc(l.url)}" target="_blank" rel="noopener">
      <span class="t">${esc(l.title)}</span><span class="u">${esc(l.url)}</span>
      <span class="cat">${esc(l.cat)}</span></a>`).join("")
    : `<div class="card muted" style="grid-column:1/-1;text-align:center">这个分类还没有收藏 ✧</div>`;
}
$("#linkForm").addEventListener("submit", e => {
  e.preventDefault();
  let url = $("#linkUrl").value.trim();
  if (!/^https?:\/\//.test(url)) url = "https://" + url;
  const list = store.get("links", []);
  list.unshift({ id: uid(), url, title: $("#linkTitle").value.trim() || url, cat: $("#linkCat").value });
  store.set("links", list);
  e.target.reset(); linkCat = "全部"; renderLinkChips(); renderLinks();
});
$("#linkFilter").addEventListener("click", e => {
  if (e.target.dataset.cat) { linkCat = e.target.dataset.cat; renderLinkChips(); renderLinks(); }
});

/* ============ GUIDES（.docx 导入预览） ============ */
$("#guideFile").addEventListener("change", e => {
  const file = e.target.files[0]; if (!file) return;
  const bar = $("#guideProgressBar"), wrap = $("#guideProgress");
  wrap.classList.remove("hidden"); bar.style.width = "40%";
  file.arrayBuffer().then(buf => {
    bar.style.width = "80%";
    const container = $("#guideViewBody");
    container.innerHTML = "";
    window.docx.renderAsync(buf, container);
    const list = store.get("guides", []);
    // 预览 HTML 太大时不入库存 HTML，只存文件名和导入时间；再次点开重新选文件即可
    list.unshift({ id: uid(), name: file.name, ts: fmtTime(Date.now()) });
    store.set("guides", list.slice(0, 20));
    $("#guideViewTitle").textContent = "📄 " + file.name;
    $("#guideViewer").classList.remove("hidden");
    bar.style.width = "100%";
    setTimeout(() => { wrap.classList.add("hidden"); bar.style.width = "0"; }, 400);
    renderGuideList();
    e.target.value = "";
  });
});
function renderGuideList() {
  const list = store.get("guides", []);
  $("#guideList").innerHTML = list.length ? list.map(g =>
    `<li><span>📄 ${esc(g.name)} <span class="muted">${g.ts}</span></span>
      <button class="del-btn" data-guide="${g.id}">✕</button></li>`).join("")
    : `<li class="muted" style="border:none">还没有导入过 Word 攻略</li>`;
}
$("#guideList").addEventListener("click", e => {
  const id = e.target.dataset.guide;
  if (id) { store.set("guides", store.get("guides", []).filter(g => g.id !== id)); renderGuideList(); }
});
$("#guideClose").addEventListener("click", () => $("#guideViewer").classList.add("hidden"));

/* ============ init ============ */
renderGuestbook(); renderMemos(); renderDiary(); renderLinkChips(); renderLinks(); renderGuideList();
initBGM();
