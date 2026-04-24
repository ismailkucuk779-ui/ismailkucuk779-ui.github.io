/* ════════════════════════════════════════════════
   PlanAI — app.js
   Firebase Auth + Dashboard Logic + Animations
   (Framer Motion emülasyonu: CSS + JS transitions)
════════════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────────────
// FIREBASE CONFIGURATION & INIT
// ──────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

let firebaseApp  = null;
let firebaseAuth = null;
let currentUser  = null;

function initFirebase() {
  try {
    // Firebase SDK'ların CDN'den yüklü olması gerekir.
    // Gerçek projede index.html <head>'ine ekleyin:
    // <script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js"></script>
    // <script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-auth-compat.js"></script>
    if (typeof firebase !== 'undefined') {
      firebaseApp  = firebase.initializeApp(FIREBASE_CONFIG);
      firebaseAuth = firebase.auth();
      firebaseAuth.onAuthStateChanged(user => {
        if (user) {
          currentUser = user;
          loginSuccess(user.displayName || 'Kullanıcı', user.email || '', user.photoURL || null);
        }
      });
      console.log('[PlanAI] Firebase başlatıldı.');
    } else {
      console.warn('[PlanAI] Firebase SDK bulunamadı — Demo modunda çalışılıyor.');
    }
  } catch (e) {
    console.warn('[PlanAI] Firebase init hatası:', e.message);
  }
}

// ──────────────────────────────────────────────
// AUTH HANDLERS
// ──────────────────────────────────────────────
function handleLogin() {
  if (firebaseAuth) {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebaseAuth.signInWithPopup(provider)
      .then(result => {
        const u = result.user;
        loginSuccess(u.displayName, u.email, u.photoURL);
      })
      .catch(err => {
        showToast('⚠️ Giriş başarısız: ' + err.message);
      });
  } else {
    // Demo fallback
    loginSuccess('Google Kullanıcı', 'user@gmail.com', null);
  }
}

function handleDemo() {
  loginSuccess('Demo Kullanıcı', 'demo@planai.app', null);
}

function loginSuccess(name, email, photo) {
  document.getElementById('userName').textContent  = name  || 'Kullanıcı';
  document.getElementById('userEmail').textContent = email || '';
  document.getElementById('userAvatar').textContent = (name || 'U').charAt(0).toUpperCase();

  if (photo) {
    const av = document.getElementById('userAvatar');
    av.style.backgroundImage = `url(${photo})`;
    av.style.backgroundSize  = 'cover';
    av.textContent = '';
  }

  // Transition: login out, app in
  const loginEl = document.getElementById('login-screen');
  loginEl.style.opacity    = '0';
  loginEl.style.transition = 'opacity .5s ease';
  setTimeout(() => {
    loginEl.classList.add('hidden');
    const appEl = document.getElementById('app');
    appEl.classList.remove('hidden');
    appEl.style.opacity    = '0';
    appEl.style.transition = 'opacity .5s ease';
    requestAnimationFrame(() => { appEl.style.opacity = '1'; });
    initApp();
  }, 500);
}

function handleLogout() {
  if (firebaseAuth) firebaseAuth.signOut();
  document.getElementById('app').classList.add('hidden');
  const loginEl = document.getElementById('login-screen');
  loginEl.classList.remove('hidden');
  loginEl.style.opacity = '1';
  showToast('👋 Çıkış yapıldı.');
}

// ──────────────────────────────────────────────
// TASK DATA
// ──────────────────────────────────────────────
const CATEGORY_COLORS = {
  '⚙️ Mühendislik':   { color: '#38bdf8', bg: 'rgba(56,189,248,.12)',  grad: 'linear-gradient(135deg,rgba(56,189,248,.18),rgba(14,165,233,.08))' },
  '🧮 Yazılım':       { color: '#a78bfa', bg: 'rgba(167,139,250,.12)', grad: 'linear-gradient(135deg,rgba(167,139,250,.18),rgba(139,92,246,.08))' },
  '🤖 İçerik Üretimi':{ color: '#f472b6', bg: 'rgba(244,114,182,.12)', grad: 'linear-gradient(135deg,rgba(244,114,182,.18),rgba(236,72,153,.08))' },
  '🇬🇧 Dil Eğitimi':  { color: '#fbbf24', bg: 'rgba(251,191,36,.12)',  grad: 'linear-gradient(135deg,rgba(251,191,36,.18),rgba(245,158,11,.08))' },
  '🎮 Serbest Zaman': { color: '#34d399', bg: 'rgba(52,211,153,.12)',  grad: 'linear-gradient(135deg,rgba(52,211,153,.18),rgba(16,185,129,.08))' },
  '📚 Eğitim':        { color: '#fb923c', bg: 'rgba(251,146,60,.12)',  grad: 'linear-gradient(135deg,rgba(251,146,60,.18),rgba(249,115,22,.08))' },
  '💼 İş':            { color: '#6366f1', bg: 'rgba(99,102,241,.12)',  grad: 'linear-gradient(135deg,rgba(99,102,241,.18),rgba(79,70,229,.08))' },
};

let tasks = [
  { id:1, start:'09:00', end:'11:00', cat:'⚙️ Mühendislik',    name:'SolidWorks 2025 ile Makine Parçası Montaj Pratiği', done:false },
  { id:2, start:'11:30', end:'13:00', cat:'🧮 Yazılım',        name:'MATLAB ile Denklem Çözümleri ve Algoritma Testi',   done:false },
  { id:3, start:'14:00', end:'15:30', cat:'🤖 İçerik Üretimi', name:'"yapahmühendis" Instagram Sayfası İçin Yeni Video Scripti Taslağı', done:false },
  { id:4, start:'16:00', end:'17:30', cat:'🇬🇧 Dil Eğitimi',   name:'A1 Seviye İngilizce Grammar Pratiği ve "Many vs. Much" Kuralları', done:false },
  { id:5, start:'19:00', end:'20:30', cat:'🎮 Serbest Zaman',  name:'Blackhawk Rescue Mission 5 Ekipman Düzenlemesi',    done:false },
];
let nextTaskId = 6;

// ──────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────
function timeToMins(t) {
  const [h,m] = t.split(':').map(Number); return h*60+m;
}
function calcDuration(start, end) {
  const d = timeToMins(end) - timeToMins(start);
  const h = Math.floor(d/60), m = d%60;
  return h > 0 ? (m ? `${h}s ${m}dk` : `${h}s`) : `${m}dk`;
}
function formatDate() {
  return new Date().toLocaleDateString('tr-TR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ──────────────────────────────────────────────
// APP INIT
// ──────────────────────────────────────────────
function initApp() {
  document.getElementById('currentDate').textContent = formatDate();
  injectSvgDefs();
  renderAll();
  populateFocusSelect();
  renderHourTimeline();
  renderStatsView();
}

function renderAll() {
  renderStatsRow();
  renderTimeline();
  renderProgress();
  renderCategories();
  renderNextTask();
}

// ──────────────────────────────────────────────
// SVG GRADIENT DEFS
// ──────────────────────────────────────────────
function injectSvgDefs() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  svg.innerHTML = `
    <defs>
      <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
      <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>
    </defs>`;
  document.body.prepend(svg);
}

// ──────────────────────────────────────────────
// STAT CARDS ROW
// ──────────────────────────────────────────────
function renderStatsRow() {
  const done   = tasks.filter(t=>t.done).length;
  const total  = tasks.length;
  const totalH = tasks.reduce((acc,t) => acc + (timeToMins(t.end)-timeToMins(t.start)), 0);
  const pct    = total ? Math.round(done/total*100) : 0;

  const cards = [
    { icon:'📋', label:'Toplam Görev',    val: total,          color:'#6366f1', bg:'rgba(99,102,241,.15)'  },
    { icon:'✅', label:'Tamamlanan',       val: done,           color:'#34d399', bg:'rgba(52,211,153,.15)'  },
    { icon:'⏱️', label:'Planlanan Süre',  val: `${Math.floor(totalH/60)}s ${totalH%60}dk`, color:'#38bdf8', bg:'rgba(56,189,248,.15)' },
    { icon:'🎯', label:'Tamamlanma %',    val: `%${pct}`,      color:'#fbbf24', bg:'rgba(251,191,36,.15)'  },
  ];

  const container = document.getElementById('statsRow');
  container.innerHTML = cards.map((c,i) => `
    <div class="stat-card" style="animation-delay:${i*0.08}s">
      <div class="stat-icon" style="background:${c.bg}; font-size:1.3rem">${c.icon}</div>
      <div>
        <div class="stat-val" style="color:${c.color}">${c.val}</div>
        <div class="stat-lbl">${c.label}</div>
      </div>
    </div>
  `).join('');
}

// ──────────────────────────────────────────────
// TIMELINE CARDS (Framer Motion emülasyonu: staggered CSS animations)
// ──────────────────────────────────────────────
function renderTimeline() {
  const container = document.getElementById('taskTimeline');
  const sorted    = [...tasks].sort((a,b) => timeToMins(a.start)-timeToMins(b.start));

  if (sorted.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:2rem;">Henüz görev yok. "Görev Ekle" butonuna tıklayın.</div>`;
    return;
  }

  container.innerHTML = sorted.map((t,i) => {
    const cfg = CATEGORY_COLORS[t.cat] || { color:'#6366f1', grad:'linear-gradient(135deg,rgba(99,102,241,.15),transparent)' };
    const dur = calcDuration(t.start, t.end);
    return `
      <div class="task-card ${t.done?'done':''}" id="task-${t.id}"
           style="background:${cfg.grad}; animation-delay:${i*0.1}s"
           draggable="true"
           ondragstart="onDragStart(event,${t.id})"
           ondrop="onDrop(event,${t.id})"
           ondragover="event.preventDefault()">
        <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${cfg.color};border-radius:2px 0 0 2px;"></div>
        <div class="task-time-col">
          <span class="task-time" style="color:${cfg.color}">${t.start}</span>
          <span class="task-time" style="color:var(--text-muted)">${t.end}</span>
          <span class="task-dur">${dur}</span>
        </div>
        <div class="task-body">
          <div class="task-cat">${t.cat}</div>
          <div class="task-name">${t.name}</div>
        </div>
        <div class="task-check ${t.done?'checked':''}" onclick="toggleTask(${t.id})" title="Tamamlandı olarak işaretle"></div>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────
// DRAG & DROP
// ──────────────────────────────────────────────
let dragId = null;
function onDragStart(e, id) { dragId = id; e.dataTransfer.effectAllowed = 'move'; }
function onDrop(e, targetId) {
  e.preventDefault();
  if (dragId === null || dragId === targetId) return;
  const di = tasks.findIndex(t=>t.id===dragId);
  const ti = tasks.findIndex(t=>t.id===targetId);
  // Swap start/end times
  [tasks[di].start, tasks[ti].start] = [tasks[ti].start, tasks[di].start];
  [tasks[di].end,   tasks[ti].end]   = [tasks[ti].end,   tasks[di].end];
  dragId = null;
  renderAll();
  showToast('🔄 Görevler yeniden sıralandı.');
}

// ──────────────────────────────────────────────
// TOGGLE TASK
// ──────────────────────────────────────────────
function toggleTask(id) {
  const t = tasks.find(t=>t.id===id);
  if (!t) return;
  t.done = !t.done;
  renderAll();
  showToast(t.done ? `✅ "${t.name.slice(0,30)}…" tamamlandı!` : `↩️ Görev geri alındı.`);
}

// ──────────────────────────────────────────────
// PROGRESS DONUT
// ──────────────────────────────────────────────
function renderProgress() {
  const done  = tasks.filter(t=>t.done).length;
  const total = tasks.length;
  const pct   = total ? done/total : 0;
  const circ  = 2 * Math.PI * 38; // r=38
  const dash  = pct * circ;

  document.getElementById('donutPct').textContent    = `%${Math.round(pct*100)}`;
  document.getElementById('completedCount').textContent = done;
  document.getElementById('remainingCount').textContent = total - done;

  const totalMins = tasks.reduce((acc,t)=>acc+(timeToMins(t.end)-timeToMins(t.start)),0);
  document.getElementById('totalHours').textContent  = `${Math.floor(totalMins/60)}s`;

  const fg = document.getElementById('donutFg');
  if (fg) {
    fg.style.strokeDasharray = `${dash} ${circ}`;
  }
}

// ──────────────────────────────────────────────
// CATEGORY BREAKDOWN
// ──────────────────────────────────────────────
function renderCategories() {
  const counts = {};
  tasks.forEach(t => { counts[t.cat] = (counts[t.cat]||0)+1; });
  const max = Math.max(...Object.values(counts), 1);
  const list = document.getElementById('categoryList');
  list.innerHTML = Object.entries(counts).map(([cat,n]) => {
    const cfg   = CATEGORY_COLORS[cat] || { color:'#6366f1' };
    const width = Math.round(n/max*100);
    return `
      <div class="cat-row">
        <span class="cat-name" style="font-size:.78rem">${cat}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar" style="width:${width}%;background:${cfg.color};"></div>
        </div>
        <span class="cat-count">${n}</span>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────
// NEXT TASK
// ──────────────────────────────────────────────
function renderNextTask() {
  const now  = new Date();
  const mins = now.getHours()*60 + now.getMinutes();
  const next = tasks
    .filter(t => !t.done && timeToMins(t.start) > mins)
    .sort((a,b) => timeToMins(a.start)-timeToMins(b.start))[0];

  const el = document.getElementById('nextTask');
  if (!next) {
    el.innerHTML = `<p style="color:var(--text-muted);font-size:.85rem">Bugün için daha fazla görev yok 🎉</p>`;
    return;
  }
  const cfg = CATEGORY_COLORS[next.cat] || { color:'#6366f1' };
  el.innerHTML = `
    <div class="next-task-time" style="color:${cfg.color}">${next.start} – ${next.end}</div>
    <div class="next-task-name">${next.name}</div>
    <div style="margin-top:.5rem;font-size:.75rem;color:var(--text-muted)">${next.cat}</div>`;
}

// ──────────────────────────────────────────────
// HOUR TIMELINE VIEW
// ──────────────────────────────────────────────
function renderHourTimeline() {
  const hours = Array.from({length:16},(_,i)=>i+7); // 07:00 – 22:00
  const container = document.getElementById('hourTimeline');

  container.innerHTML = hours.map(h => {
    const label    = `${String(h).padStart(2,'0')}:00`;
    const inHour   = tasks.filter(t => {
      const ts = timeToMins(t.start), te = timeToMins(t.end);
      return ts >= h*60 && ts < (h+1)*60;
    });
    const hasTask  = inHour.length > 0;
    const chips    = inHour.map(t => {
      const cfg = CATEGORY_COLORS[t.cat] || { color:'#6366f1' };
      return `<div class="hour-task-chip" style="border-color:${cfg.color}44;background:${cfg.color}18;color:${cfg.color}">
        ${t.cat} ${t.name.slice(0,45)}${t.name.length>45?'…':''}
      </div>`;
    }).join('');

    return `
      <div class="hour-row ${hasTask?'has-task':''}">
        <span class="hour-label">${label}</span>
        <div class="hour-tasks">${chips}</div>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────
// STATS VIEW
// ──────────────────────────────────────────────
function renderStatsView() {
  // Category bars
  const counts = {};
  tasks.forEach(t => { counts[t.cat] = (counts[t.cat]||0) + (timeToMins(t.end)-timeToMins(t.start)); });
  const max = Math.max(...Object.values(counts), 1);
  document.getElementById('statsCategoryBars').innerHTML = Object.entries(counts).map(([cat,mins]) => {
    const cfg = CATEGORY_COLORS[cat] || { color:'#6366f1' };
    const w   = Math.round(mins/max*100);
    const h   = `${Math.floor(mins/60)}s ${mins%60}dk`;
    return `
      <div class="stats-bar-row">
        <div class="stats-bar-label"><span>${cat}</span><span style="color:${cfg.color}">${h}</span></div>
        <div class="stats-bar-track"><div class="stats-bar-fill" style="width:${w}%;background:${cfg.color}"></div></div>
      </div>`;
  }).join('');

  // Weekly chart (mock data)
  const days  = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  const vals  = [65,80,45,90,55,70,tasks.filter(t=>t.done).length/tasks.length*100||30];
  const maxV  = Math.max(...vals);
  document.getElementById('weeklyChart').innerHTML = days.map((d,i) => {
    const h = Math.round(vals[i]/maxV*100);
    const isTd = i===new Date().getDay()-1;
    return `
      <div class="week-bar-wrap">
        <div class="week-bar" style="height:${h}%;${isTd?'background:linear-gradient(180deg,#34d399,#059669)':''}"></div>
        <span class="week-label" style="${isTd?'color:#34d399;font-weight:700':''}">${d}</span>
      </div>`;
  }).join('');
}

// ──────────────────────────────────────────────
// ADD TASK MODAL
// ──────────────────────────────────────────────
function openAddModal() {
  document.getElementById('addModal').classList.remove('hidden');
  document.getElementById('newTaskName').focus();
}
function closeAddModal() {
  document.getElementById('addModal').classList.add('hidden');
}
function closeModalOutside(e) {
  if (e.target.id === 'addModal') closeAddModal();
}
function addTask() {
  const name  = document.getElementById('newTaskName').value.trim();
  const start = document.getElementById('newTaskStart').value;
  const end   = document.getElementById('newTaskEnd').value;
  const cat   = document.getElementById('newTaskCat').value;

  if (!name) { showToast('⚠️ Görev adı boş bırakılamaz.'); return; }
  if (timeToMins(start) >= timeToMins(end)) { showToast('⚠️ Bitiş saati başlangıçtan büyük olmalı.'); return; }

  tasks.push({ id: nextTaskId++, start, end, cat, name, done: false });
  closeAddModal();
  renderAll();
  renderHourTimeline();
  renderStatsView();
  populateFocusSelect();
  document.getElementById('newTaskName').value = '';
  showToast(`✅ "${name.slice(0,25)}" eklendi!`);
}

// ──────────────────────────────────────────────
// FOCUS MODE / POMODORO TIMER
// ──────────────────────────────────────────────
let timerInterval = null;
let timerSeconds  = 25 * 60;
let timerRunning  = false;
let pomodorosDone = 0;
const POMODORO    = 25 * 60;
const BREAK       = 5  * 60;
let isBreak       = false;

function populateFocusSelect() {
  const sel = document.getElementById('focusTaskSelect');
  if (!sel) return;
  sel.innerHTML = tasks.map(t => `<option value="${t.id}">${t.start} – ${t.cat} ${t.name.slice(0,40)}</option>`).join('');
}

function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ Devam Et';
  } else {
    timerRunning = true;
    document.getElementById('timerStartBtn').textContent = '⏸ Duraklat';
    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        if (!isBreak) {
          pomodorosDone++;
          document.getElementById('pomodoroCount').textContent = pomodorosDone;
          showToast('🍅 Pomodoro tamamlandı! 5 dk mola.');
          isBreak = true;
          timerSeconds = BREAK;
          document.getElementById('timerMode').textContent = 'Mola';
        } else {
          showToast('✅ Mola bitti! Yeni Pomodoro başlatın.');
          isBreak = false;
          timerSeconds = POMODORO;
          document.getElementById('timerMode').textContent = 'Odak';
        }
        document.getElementById('timerStartBtn').textContent = '▶ Başlat';
      }
      updateTimerDisplay();
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning  = false;
  isBreak       = false;
  timerSeconds  = POMODORO;
  document.getElementById('timerStartBtn').textContent = '▶ Başlat';
  document.getElementById('timerMode').textContent     = 'Odak';
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds/60);
  const s = timerSeconds % 60;
  document.getElementById('timerDisplay').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const total  = isBreak ? BREAK : POMODORO;
  const circ   = 2 * Math.PI * 85; // r=85
  const remain = timerSeconds / total;
  const offset = circ * (1 - remain);
  const fg = document.getElementById('timerRingFg');
  if (fg) fg.style.strokeDashoffset = offset;
}

// ──────────────────────────────────────────────
// VIEW NAVIGATION
// ──────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add('active');

  const nav = document.getElementById(`nav-${name}`);
  if (nav) nav.classList.add('active');
}

// ──────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────
let toastTimeout = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ──────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAddModal();
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openAddModal(); }
});

// ──────────────────────────────────────────────
// BOOTSTRAP
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  updateTimerDisplay();
});
