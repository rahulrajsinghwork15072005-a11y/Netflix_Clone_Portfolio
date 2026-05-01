/* ══════════════════════════════════════════════════
   RAHUL RAJ SINGH — PORTFOLIO SCRIPT
   (Stalker RPG integration included)
   Real projects, real resume, real everything.
═════════════════════════════════════════════════ */

// ─── AUDIO ENGINE ───────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio() { if (!audioCtx) audioCtx = new AudioCtx(); }

function playTadum() {
  ensureAudio();
  const t = audioCtx.currentTime;
  const o1 = audioCtx.createOscillator(), g1 = audioCtx.createGain();
  o1.connect(g1); g1.connect(audioCtx.destination);
  o1.type = 'sawtooth';
  o1.frequency.setValueAtTime(80, t);
  o1.frequency.exponentialRampToValueAtTime(140, t + .12);
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(.6, t + .02);
  g1.gain.exponentialRampToValueAtTime(.001, t + .5);
  o1.start(t); o1.stop(t + .5);
  const o2 = audioCtx.createOscillator(), g2 = audioCtx.createGain();
  o2.connect(g2); g2.connect(audioCtx.destination);
  o2.type = 'sawtooth';
  o2.frequency.setValueAtTime(120, t + .18);
  o2.frequency.exponentialRampToValueAtTime(220, t + .35);
  g2.gain.setValueAtTime(0, t + .18);
  g2.gain.linearRampToValueAtTime(.9, t + .22);
  g2.gain.exponentialRampToValueAtTime(.001, t + 1.4);
  o2.start(t + .18); o2.stop(t + 1.4);
  const sub = audioCtx.createOscillator(), sg = audioCtx.createGain();
  sub.connect(sg); sg.connect(audioCtx.destination);
  sub.type = 'sine';
  sub.frequency.setValueAtTime(55, t + .18);
  sub.frequency.exponentialRampToValueAtTime(40, t + .6);
  sg.gain.setValueAtTime(0, t + .18);
  sg.gain.linearRampToValueAtTime(.7, t + .22);
  sg.gain.exponentialRampToValueAtTime(.001, t + 1.0);
  sub.start(t + .18); sub.stop(t + 1.0);
}

function playClick() {
  ensureAudio();
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(900, t);
  o.frequency.exponentialRampToValueAtTime(400, t + .1);
  g.gain.setValueAtTime(.3, t);
  g.gain.exponentialRampToValueAtTime(.001, t + .12);
  o.start(t); o.stop(t + .12);
}


// ─── PARTICLE SYSTEM ────────────────────────
const particleCanvas = document.getElementById('particle-canvas');
const pCtx = particleCanvas.getContext('2d');
let particles = [];
let particleAnimId = null;

function resizeParticleCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}

function initParticles(count = 60) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      r: Math.random() * 2 + .5,
      dx: (Math.random() - .5) * .3,
      dy: (Math.random() - .5) * .3,
      alpha: Math.random() * .4 + .1,
    });
  }
}

function drawParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach(p => {
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(229,9,20,${p.alpha})`;
    pCtx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > particleCanvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > particleCanvas.height) p.dy *= -1;
  });
  particleAnimId = requestAnimationFrame(drawParticles);
}

function startParticles() {
  resizeParticleCanvas();
  initParticles();
  particleCanvas.classList.remove('hidden');
  if (!particleAnimId) drawParticles();
}

function stopParticles() {
  particleCanvas.classList.add('hidden');
  if (particleAnimId) { cancelAnimationFrame(particleAnimId); particleAnimId = null; }
}

window.addEventListener('resize', () => { if (!particleCanvas.classList.contains('hidden')) resizeParticleCanvas(); });


// ─── CUSTOM CURSOR ──────────────────────────
const cursor = document.getElementById('custom-cursor');
let cursorX = 0, cursorY = 0, currentX = 0, currentY = 0;

document.addEventListener('mousemove', e => { cursorX = e.clientX; cursorY = e.clientY; });

function animateCursor() {
  currentX += (cursorX - currentX) * .15;
  currentY += (cursorY - currentY) * .15;
  cursor.style.transform = `translate(${currentX - 10}px, ${currentY - 10}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

function bindCursorHover() {
  document.querySelectorAll('a, button, .profile-card, .km-tile, .pro-proj-card, .km-watched-item, .know-tab, .manage-profiles, .km-blog-card').forEach(el => {
    el.onmouseenter = () => cursor.classList.add('hovering');
    el.onmouseleave = () => cursor.classList.remove('hovering');
  });
}
bindCursorHover();


// ─── SCROLL PROGRESS BAR ────────────────────
const scrollProgress = document.getElementById('scroll-progress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress);


// ─── PARALLAX HERO ──────────────────────────
function applyParallax() {
  const scrollY = window.scrollY;
  const proHero = document.querySelector('.pro-hero');
  if (proHero && !document.getElementById('pro-site').classList.contains('hidden')) {
    proHero.style.transform = `translateY(${scrollY * 0.15}px)`;
  }
  const kmHero = document.querySelector('.km-hero-strip');
  if (kmHero && !document.getElementById('know-site').classList.contains('hidden')) {
    kmHero.style.transform = `translateY(${scrollY * 0.1}px)`;
  }
}

window.addEventListener('scroll', applyParallax, { passive: true });


// ─── SECTION REVEAL ON SCROLL ───────────────
function initSectionReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  sections.forEach(s => observer.observe(s));
}

function markSectionsForReveal() {
  document.querySelectorAll('#pro-site section, .km-subsection').forEach(s => {
    s.classList.add('reveal-section');
  });
  initSectionReveal();
}


// ─── BACK TO TOP BUTTON ─────────────────────
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (!backToTop) return;
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });


// ─── INTRO ──────────────────────────────────
let introPlayed = false;
const introScreen = document.getElementById('intro-screen');
const introWrap   = document.getElementById('intro-text-wrap');

introWrap.addEventListener('click', () => {
  if (introPlayed) return;
  introPlayed = true;
  playTadum();
  startParticles();
  introScreen.classList.add('zooming');
  setTimeout(() => {
    introScreen.classList.add('fade-out');
    showProfileScreen();
  }, 1100);
  setTimeout(() => { introScreen.classList.add('hidden'); stopParticles(); }, 1700);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !introPlayed && !introScreen.classList.contains('hidden'))
    introWrap.click();
});


// ─── PROFILES ───────────────────────────────
const profileScreen = document.getElementById('profile-screen');

function showProfileScreen() {
  profileScreen.classList.remove('hidden');
  profileScreen.style.opacity = '0';
  requestAnimationFrame(() => {
    profileScreen.style.transition = 'opacity .5s ease .3s';
    profileScreen.style.opacity = '1';
  });
}

function selectProfile(card) {
  playClick();
  const profile = card.dataset.profile;
  card.classList.add('selected');
  setTimeout(() => profileScreen.classList.add('fade-out'), 400);
  setTimeout(() => {
    profileScreen.classList.add('hidden');
    if (profile === 'know-me') {
      showKnowSite();
    } else if (profile === 'stalker') {
      showStalkerSite();
    } else {
      showProSite(profile);
    }
  }, 900);
}

function backToProfiles() {
  const pro  = document.getElementById('pro-site');
  const know = document.getElementById('know-site');
  const stalker = document.getElementById('stalker-site');

  document.querySelectorAll('.reveal-section.revealed').forEach(s => s.classList.remove('revealed'));

  [pro, know, stalker].forEach(s => {
    if (s && !s.classList.contains('hidden')) {
      s.style.transition = 'opacity .4s ease';
      s.style.opacity = '0';
      setTimeout(() => {
        s.classList.add('hidden');
        s.style.opacity = '';
      }, 400);
    }
  });

  scrollProgress.classList.remove('hidden');

  setTimeout(() => {
    profileScreen.classList.remove('hidden', 'fade-out');
    profileScreen.style.opacity = '1';
    document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('selected'));
  }, 400);
}


// ─── STALKER SITE (RPG) ─────────────────────
function showStalkerSite() {
  const stalker = document.getElementById('stalker-site');
  stalker.classList.remove('hidden');
  scrollProgress.classList.add('hidden');
}


// ─── PROFESSIONAL SITE ──────────────────────
function showProSite(profile) {
  const pro = document.getElementById('pro-site');
  pro.classList.remove('hidden');
  requestAnimationFrame(() => pro.classList.add('visible'));
  scrollProgress.classList.remove('hidden');
  initProNavHighlight();
  setTimeout(markSectionsForReveal, 100);
}

function initProNavHighlight() {
  const sections = document.querySelectorAll('#pro-site section[id]');
  const links    = document.querySelectorAll('.pro-nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.pro-nav-link[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: .4 });
  sections.forEach(s => obs.observe(s));

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('pro-navbar');
    if (!nav) return;
    nav.style.boxShadow = window.scrollY > 10 ? '0 1px 20px rgba(0,0,0,.08)' : 'none';
  });

  const bars = document.querySelectorAll('.psb-fill');
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'barGrow .9s ease-out forwards';
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: .1 });
  bars.forEach(b => { b.style.transform = 'scaleX(0)'; barObs.observe(b); });
}

function triggerCVDownload() {
  const resumeText = `RAHUL RAJ SINGH
Data Analyst & AI Enthusiast
═══════════════════════════════

CONTACT
Email: rahulrajsingh.work.15072005@gmail.com
Phone: +91 89256 95503
LinkedIn: linkedin.com/in/rahul-raj-singh-57442a3b3
GitHub: github.com/rahulrajsinghwork15072005-a11y

EXPERIENCE
─────────────────────────────

Tech Lead (AI Robotics) | Havoltz | Sep 2025 – May 2026
- Led team of 6 engineers to build AI-powered line-following robots
- Sensor fusion & OpenCV simulation cut tuning time by 40%
- Dashboards for lap times & sensor drift

Senior Data Analyst Intern | E‑Search Advisors | May 2025 – Aug 2025
- SEO analysis boosted organic traffic by 28%
- Looker Studio dashboards reduced reporting time by 75%
- A/B testing, regression models, mentored 3 junior interns

Management & Data Strategy Lead | DAO Club | Sep 2024 – Present
- 150+ member Web3 club, analytics dashboards, 45% engagement lift
- Budget tracking, event sentiment analysis, membership segmentation

Junior Data Analyst Intern | E‑Search Advisors | May 2024 – Aug 2024
- Data cleaning & standardisation (Excel, Python)
- Reduced processing time 25%, outlier detection (IQR)

EDUCATION
─────────────────────────────
B.Tech Computer Science | VIT Chennai | 2023 – 2027
Class XII (AISSCE) | GT Aloha Vidya Mandir | 90.2%
Class X (AISSE) | St. John's Universal School | 94.2%

SKILLS
─────────────────────────────
Languages: Python , C/C++ , SQL , JavaScript
Data & Analytics: pandas, NumPy , scikit-learn , Power BI ,Looker 
Tools: Git/GitHub, VS Code  ,Jupyter, Docker  ,AWS, Raspberry Pi, OpenCV
`;
  const blob = new Blob([resumeText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'Rahul_Raj_Singh_Resume.txt'; a.click();
  URL.revokeObjectURL(url);
}

// PRO PROJECT MODAL DATA (REAL PROJECTS)
// PRO PROJECT MODAL DATA (ALL 10 PROJECTS)
const projectData = {
  proj1: {
    title: 'Compiler Visualizer',
    tag: 'COMPILER · PARSING ALGORITHMS',
    stack: ['JavaScript', 'HTML/CSS', 'LL(1)', 'LR(0)', 'SLR(1)', 'LALR(1)', 'CLR(1)', 'Operator Precedence'],
    desc: 'An interactive educational tool that visualizes six parsing algorithms (LL(1), LR(0), SLR, LALR, CLR, Operator Precedence) step by step. Automatically computes FIRST and FOLLOW sets, constructs LR items and DFA, and generates Three-Address Code (TAC) and x86 assembly output.',
    highlights: [
      'Six parsing algorithms with live step-through',
      'Custom grammar input with immediate analysis',
      'FIRST/FOLLOW computation & LR item construction',
      'TAC generation & x86 assembly output',
      'Fully client‑side – no server required'
    ],
    github: 'https://github.com/rahulrajsinghwork15072005-a11y/Compiler_Visualised_RRS',
    live: 'https://compiler-visualised-rrs.vercel.app/#parser-playground',
  },
  proj2: {
    title: 'Ultimate OS Visualizer – Y2K Edition',
    tag: 'SIMULATOR · OPERATING SYSTEMS',
    stack: ['JavaScript', 'Canvas API', 'Chart.js', 'HTML5', 'CSS3'],
    desc: 'A retro Y2K-themed OS simulator that brings core operating system algorithms to life. Includes CPU scheduling (FCFS, SJF, RR, MLFQ, EDF), deadlock handling (Banker\'s algorithm, wait‑for graphs), disk scheduling (FCFS, SSTF, SCAN, C‑LOOK), paging/segmentation/virtual memory, and IPC (producer‑consumer, readers‑writers, dining philosophers).',
    highlights: [
      '15+ algorithms animated in real time',
      'Interactive charts and live performance metrics',
      'Step‑by‑step execution with visual stack/heap',
      'Classic synchronization problems with semaphores',
      'Fully vanilla JS – no frameworks'
    ],
    github: '',
    live: '',
  },
  proj3: {
    title: 'WikiBoard',
    tag: 'RESEARCH TOOL · SPATIAL CANVAS',
    stack: ['JavaScript', 'Wikipedia API', 'SVG', 'HTML5', 'CSS3'],
    desc: 'A spatial knowledge canvas where you can drag Wikipedia articles onto an infinite board, draw labelled connections, add sticky notes, group concepts, and export your mind map as JSON. Includes minimap navigation, dark/light themes, and full keyboard shortcuts.',
    highlights: [
      'Drag & drop Wikipedia articles (auto‑fetch summary)',
      'Draw curved/stepped arrows between concepts',
      'Sticky notes, free‑form labels, image pop‑outs',
      'Minimap, groups, zoom/pan, JSON export',
      'Pure vanilla JS – no frameworks'
    ],
    github: '',
    live: '',
  },
  proj4: {
    title: 'WebOS XP',
    tag: 'WEB DESKTOP · OPERATING SYSTEM',
    stack: ['JavaScript', 'Canvas API', 'localStorage', 'HTML5', 'CSS3'],
    desc: 'A fully functional Windows XP desktop environment running in the browser. Boots with a CLI, login prompt, then reveals a pixel‑perfect desktop with draggable windows, 15+ apps (Notepad, Paint, Media Player, Calculator, Browser), 9 games (Snake, Tetris, Minesweeper, Flappy Bird…), virtual file system, context menus, and dozens of easter eggs.',
    highlights: [
      '15+ draggable/resizable applications',
      '9 playable games with high scores',
      'Virtual file system persisted in localStorage',
      'Terminal with magic spells and Konami code',
      'Zero frameworks – vanilla JS mastery'
    ],
    github: '',
    live: '',
  },
  proj5: {
    title: 'Anfield Echo',
    tag: 'FAN BLOG · LIVERPOOL FC',
    stack: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'CSS Grid', 'CSS Variables'],
    desc: 'A premium Liverpool FC fan site with cinematic scroll‑telling, a horizontal archive gallery, tactical deep dives, and full light/dark theming — built entirely with vanilla HTML, CSS & JS.',
    highlights: [
      'Horizontal scroll gallery with 8 rich cards',
      'Live 4‑3‑3 formation visualisation',
      'Marquee stats, staggered reveal animations',
      'Full light/dark theme toggle',
      'Custom cursor, reading progress bar'
    ],
    github: '',
    live: '',
  },
  proj6: {
    title: 'Mockly',
    tag: 'MOCKUP TOOL · CHAT GENERATOR',
    stack: ['JavaScript', 'html2canvas', 'CSS', 'HTML5'],
    desc: 'Generate pixel‑perfect chat screenshots for 8 platforms (WhatsApp, Telegram, iMessage, Discord…) with custom avatars, backgrounds, message timelines, and typing indicators. No frameworks, no dependencies.',
    highlights: [
      '8 meticulously styled platforms',
      'Custom avatars, wallpapers, timestamps',
      'Typing indicators, date separators',
      'One‑click PNG export at 3× resolution',
      'Pure vanilla code'
    ],
    github: '',
    live: '',
  },
  proj7: {
    title: 'MakeNotes',
    tag: 'PWA · SPATIAL NOTE‑TAKING',
    stack: ['PWA', 'Service Worker', 'Canvas API', 'SVG', 'localStorage'],
    desc: 'A spatial note‑taking canvas that works offline. Drag cards, link them with arrows, add post‑it notes, edit rich text, and export to Markdown, JSON, or PNG. Installs as a Progressive Web App on phones and desktops.',
    highlights: [
      'Offline‑first PWA with auto‑save',
      'Rich‑text editor (bold, images, headings)',
      'Color‑coded connections and card groups',
      'Export to Markdown, JSON, HTML, PNG',
      'Undo/redo, search, dark mode'
    ],
    github: '',
    live: '',
  },
  proj8: {
    title: 'Dev Village XL',
    tag: 'RPG · INTERACTIVE PORTFOLIO',
    stack: ['HTML5 Canvas', 'CSS3', 'JavaScript (ES6+)', 'Web Audio API'],
    desc: 'A 2D pixel‑art RPG where you explore a 60×60 tile village to discover a developer\'s portfolio — 7 buildings, 9 NPCs, quests, items, weather, day/night cycle, and a full game loop crafted in vanilla JS.',
    highlights: [
      '60×60 procedurally generated world',
      '7 buildings, 9 NPCs, branching dialogues',
      'Quests, inventory, minimap, save/load',
      'Day/night cycle, weather system, particles',
      'Custom 8‑bit chiptune audio engine'
    ],
    github: '',
    live: '',
  },
  proj9: {
    title: 'Text‑to‑Braille Conversion System',
    tag: 'HARDWARE · AI · ASSISTIVE TECH',
    stack: ['Python', 'OpenCV', 'scikit-learn', 'Raspberry Pi', 'SVM'],
    desc: 'A portable assistive device that captures printed text via camera, classifies characters with a 92%‑accurate SVM, and outputs Braille on a refreshable display in real time.',
    highlights: [
      'Raspberry Pi camera for text capture',
      'OpenCV preprocessing and contour detection',
      'SVM classifier trained on 5,000+ samples',
      '92% accuracy on unseen fonts',
      'Real‑time Braille output via GPIO'
    ],
    github: 'https://github.com/rahulrajsinghwork15072005-a11y/braille-device',
    live: '',
  },
  proj10: {
    title: 'Yellove Echo',
    tag: 'FAN BLOG · CHENNAI SUPER KINGS',
    stack: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'MediaPipe Hands', 'View Transitions API'],
    desc: 'A CSK fan site blending premium editorial design with futuristic interactions — hand‑gesture navigation, horizontal gallery, command palette, and modern CSS APIs (popover, view‑transitions, scroll‑driven animations).',
    highlights: [
      'Hand‑gesture control (MediaPipe)',
      'Horizontal archive gallery',
      'Command palette (Cmd+K)',
      'Light/dark mode, reading progress',
      'Modern CSS: @layer, :has(), view‑transitions'
    ],
    github: '',
    live: '',
  },
};
function openProProjectModal(id) {
  const p = projectData[id];
  if (!p) return;
  const stackH = p.stack.map(s => `<span>${s}</span>`).join('');
  const hiH    = p.highlights.map(h => `<li>${h}</li>`).join('');
  const liveH  = p.live ? `<a href="${p.live}" target="_blank">↗ Live Demo</a>` : '';
  openModalWithHTML(`
    <div class="pdm-tag">${p.tag}</div>
    <div class="pdm-title">${p.title}</div>
    <div class="pdm-img">[ Add project screenshot or demo GIF here ]</div>
    <div class="pdm-body">
      <p>${p.desc}</p>
      <h3>Key Highlights</h3>
      <ul>${hiH}</ul>
      <h3>Tech Stack</h3>
    </div>
    <div class="pdm-stack">${stackH}</div>
    <div class="pdm-links">
      <a href="${p.github}" target="_blank">⌥ GitHub Repo</a>
      ${liveH}
    </div>
  `);
}


// ─── KNOW ME SITE ───────────────────────────
const hobbies = ['Music addict', 'Film nerd', 'Bookworm', 'Sports fanatic', 'Cricket lover'];
let hobbyIdx = 0;

function showKnowSite() {
  const know = document.getElementById('know-site');
  know.classList.remove('hidden');
  requestAnimationFrame(() => know.classList.add('visible'));
  scrollProgress.classList.remove('hidden');
  setTimeout(markSectionsForReveal, 100);

  setInterval(() => {
    hobbyIdx = (hobbyIdx + 1) % hobbies.length;
    const el = document.getElementById('km-rotating-hobby');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = hobbies[hobbyIdx]; el.style.opacity = '1'; el.style.transition = 'opacity .4s'; }, 200);
    }
  }, 2500);
}

function showProAndGo(sectionId) {
  const know = document.getElementById('know-site');
  know.style.transition = 'opacity .4s ease';
  know.style.opacity = '0';
  setTimeout(() => {
    know.classList.add('hidden');
    know.style.opacity = '';
    profileScreen.classList.remove('hidden', 'fade-out');
    profileScreen.style.opacity = '1';
    const recruiterCard = document.querySelector('[data-profile="recruiter"]');
    if (recruiterCard) selectProfile(recruiterCard);
    setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  }, 400);
}

function switchKnowTab(btn, sectionId) {
  document.querySelectorAll('.know-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.km-section').forEach(s => s.classList.remove('active-section'));
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active-section');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


// ─── TILE DETAIL MODAL ──────────────────────
function openTileDetail(data) {
  const spotifyBtn = data.spotifyUrl && data.spotifyUrl !== 'YOUR_SPOTIFY_LINK_HERE'
    ? `<a class="td-spotify-link" href="${data.spotifyUrl}" target="_blank">▶ Open in Spotify</a>`
    : (data.spotifyUrl ? `<a class="td-spotify-link" href="#" onclick="return false" style="opacity:.5;cursor:not-allowed">▶ Add Spotify Link</a>` : '');

  openModalWithHTML(`
    <span class="td-emoji">${data.emoji}</span>
    <div class="td-title">${data.title}</div>
    <div class="td-sub">${data.sub}</div>
    <hr class="td-divider"/>
    <div class="td-body">${data.body}</div>
    ${spotifyBtn}
  `);
}


// ─── BLOG MODAL ─────────────────────────────
const blogPosts = [
  {
    tag: 'SYSTEM DESIGN', slug: 'system-design', title: 'Building a Rate Limiter from Scratch', year: '2025',
    content: `<p>Rate limiting is essential for protecting APIs from abuse and ensuring fair resource distribution. Here's how I built one using Node.js and Redis.</p>
    <h3>The Algorithm</h3>
    <p>I chose the sliding window log approach over fixed windows because it handles edge cases better — no burst at window boundaries.</p>
    <h3>Implementation</h3>
    <p>Using Redis sorted sets, each request gets a timestamp score. The middleware counts entries in the current window and rejects if over the limit.</p>
    <pre class="line-numbers"><code class="language-javascript">const Redis = require('ioredis');
const redis = new Redis();

async function isRateLimited(userId, limit = 100, windowSec = 60) {
  const key = \`ratelimit:\${userId}\`;
  const now = Date.now();
  const windowStart = now - (windowSec * 1000);

  await redis.zremrangebyscore(key, 0, windowStart);
  const count = await redis.zcard(key);
  if (count >= limit) return true;

  await redis.zadd(key, now, \`\${now}-\${Math.random()}\`);
  await redis.expire(key, windowSec);
  return false;
}</code></pre>
    <h3>Results</h3>
    <p>Handles 10k+ requests per second on a single Redis instance with sub-millisecond latency.</p>`,
  },
  {
    tag: 'REACT', slug: 'react', title: 'Why I Stopped Using useEffect', year: '2024',
    content: `<p>After years of reaching for useEffect as my first tool, I've learned that most side effects can be handled during render — and the code is cleaner for it.</p>
    <h3>The Problem</h3>
    <p>useEffect creates a separate code path that runs after render. This means your UI can be in one state while the effect hasn't fired yet, causing flickers, stale closures, and infinite loops.</p>
    <pre class="line-numbers"><code class="language-javascript">// ❌ The old way — causes flicker
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, [query]);
  return &lt;List items={results} /&gt;;
}

// ✅ The better way — derive during render
function SearchResults({ query }) {
  const results = useQuery(query, fetchResults);
  return &lt;List items={results.data} /&gt;;
}</code></pre>
    <p>Compute derived state during render. Use useMemo for expensive calculations. The result: fewer bugs, less code.</p>`,
  },
  {
    tag: 'DEVOPS', slug: 'devops', title: 'Docker Compose for Local Dev', year: '2024',
    content: `<p>My local development environment runs entirely on Docker Compose. Here's the complete setup that mirrors production as closely as possible.</p>
    <h3>Services</h3>
    <p>PostgreSQL for primary data, Redis for caching and sessions, Node.js API server, and a simple Nginx reverse proxy.</p>
    <pre class="line-numbers"><code class="language-yaml">version: '3.8'
services:
  api:
    build: .
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on: [db, redis]

  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  nginx:
    image: nginx:alpine
    volumes: [./nginx.conf:/etc/nginx/nginx.conf]
    ports: ["80:80"]
    depends_on: [api]

volumes: { pgdata: {} }</code></pre>
    <p>Volume mounts ensure code changes trigger nodemon restarts without rebuilding. It takes 8 seconds from <code>docker-compose up</code> to a fully working dev environment.</p>`,
  },
];

function calcReadTime(html) {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return mins;
}

function openBlogModal(idx) {
  const post = blogPosts[idx];
  if (!post) return;
  const readMins = calcReadTime(post.content);

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  modalBox.style.maxWidth = '720px';
  modalBox.style.animation = 'modalIn .3s cubic-bezier(.34,1.56,.64,1) forwards';

  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div class="blog-modal">
      <div class="blog-modal-header">
        <button class="blog-dark-mode-toggle" onclick="toggleBlogDarkMode(this)" title="Toggle light/dark mode">🌙</button>
        <div class="blog-modal-tag">${post.tag}</div>
        <div class="blog-modal-title">${post.title}</div>
        <div class="blog-modal-meta">
          <span class="meta-read-time">📖 ${readMins} min read</span>
          <span>${post.year}</span>
          <span>${post.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} words</span>
        </div>
      </div>
      <div class="blog-reading-progress"><div class="blog-reading-progress-fill" id="blog-read-fill"></div></div>
      <div class="blog-share-bar">
        <span>Share:</span>
        <button class="blog-share-btn" onclick="copyBlogLink('${post.title}')">🔗 Copy Link</button>
        <button class="blog-share-btn" onclick="shareTwitter('${post.title}')">𝕏 Twitter</button>
        <button class="blog-share-btn" onclick="shareLinkedIn('${post.title}', '${post.tag}')">in LinkedIn</button>
      </div>
      <div class="blog-modal-body modal-scroll-area" id="blog-modal-body">${post.content}</div>
    </div>
  `;

  if (window.Prism) Prism.highlightAllUnder(modalContent);

  const body = document.getElementById('blog-modal-body');
  const fill = document.getElementById('blog-read-fill');
  body.onscroll = () => {
    const pct = body.scrollTop / (body.scrollHeight - body.clientHeight) * 100;
    fill.style.width = Math.min(100, pct) + '%';
  };
}

function toggleBlogDarkMode(btn) {
  const body = document.getElementById('blog-modal-body');
  body.classList.toggle('light-mode');
  btn.textContent = body.classList.contains('light-mode') ? '☀️' : '🌙';
}

function copyBlogLink(title) {
  const url = window.location.href.split('#')[0] + '#blog-' + encodeURIComponent(title);
  navigator.clipboard.writeText(url).then(() => {
    const btns = document.querySelectorAll('.blog-share-btn');
    btns[0].classList.add('copied');
    btns[0].textContent = '✅ Copied!';
    setTimeout(() => { btns[0].classList.remove('copied'); btns[0].textContent = '🔗 Copy Link'; }, 2000);
  });
}

function shareTwitter(title) {
  const text = encodeURIComponent(`Check out: "${title}" by @rahulrajsingh`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareLinkedIn(title, tag) {
  const text = encodeURIComponent(`I just read "${title}" — great insights on ${tag}.`);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`, '_blank');
}

// ─── BLOG TAG FILTER ────────────────────────
function filterBlogs(tag, btn) {
  document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.km-blog-card');
  let visible = 0;
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    const show = tag === 'all' || tags.includes(tag);
    card.classList.toggle('hidden-by-filter', !show);
    if (show) visible++;
  });
  document.getElementById('blog-count').textContent = visible + ' article' + (visible !== 1 ? 's' : '');
}


// ─── SHARED MODAL ───────────────────────────
const overlay     = document.getElementById('modal-overlay');
const modalBox    = document.getElementById('modal-box');
const modalContent = document.getElementById('modal-content');

function openModalWithHTML(html) {
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  modalContent.innerHTML = html;
  modalBox.style.animation = 'modalIn .3s cubic-bezier(.34,1.56,.64,1) forwards';
}

function closeModal() {
  modalBox.style.animation = 'modalOut .2s ease forwards';
  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    modalBox.style.animation = '';
  }, 200);
}
function closeModalOnOverlay(e) {
  if (e.target === overlay) closeModal();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeModal();
});

// ─── KEYBOARD SHORTCUTS ─────────────────────
const keySections = {
  pro: ['#pro-home', '#pro-about', '#pro-skills', '#pro-projects', '#pro-cv', '#pro-contact'],
  know: ['#km-music', '#km-films', '#km-reading', '#km-sports', '#km-blogs'],
};
let currentSite = null;
let currentSectionIdx = 0;

document.addEventListener('keydown', e => {
  const proVisible = !document.getElementById('pro-site').classList.contains('hidden');
  const knowVisible = !document.getElementById('know-site').classList.contains('hidden');
  if (!proVisible && !knowVisible) return;

  currentSite = proVisible ? 'pro' : 'know';
  const sections = keySections[currentSite];

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    currentSectionIdx = (currentSectionIdx + 1) % sections.length;
    const target = document.querySelector(sections[currentSectionIdx]);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    currentSectionIdx = (currentSectionIdx - 1 + sections.length) % sections.length;
    const target = document.querySelector(sections[currentSectionIdx]);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  } else if (e.key === 'Home') {
    e.preventDefault();
    currentSectionIdx = 0;
    const target = document.querySelector(sections[0]);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  } else if (e.key === 'End') {
    e.preventDefault();
    currentSectionIdx = sections.length - 1;
    const target = document.querySelector(sections[sections.length - 1]);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }
});


// Inject animation keyframes
const s = document.createElement('style');
s.textContent = '@keyframes modalOut{to{transform:scale(.92) translateY(16px);opacity:0}}';
document.head.appendChild(s);