// ============================================================
//  DEV VILLAGE XL — RPG Portfolio  |  game.js  v2.0 (Rahul Edition)
//  10× World: 60×60 map, 6 buildings, doorstep modals, weather
// ============================================================

// ── Audio ───────────────────────────────────────────────────
let audioCtx = null, bgMusicRunning = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playBeep(freq=440, type='square', duration=0.07, vol=0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function playStep()   { if(Math.random()<0.3) playBeep(120 + Math.random()*40, 'square', 0.04, 0.04); }
function playPickup() { playBeep(660,'sine',0.2,0.16); setTimeout(()=>playBeep(880,'sine',0.15,0.12),80); }
function playDoor()   { [220,330,440,550].forEach((f,i)=>setTimeout(()=>playBeep(f,'triangle',0.16,0.18),i*70)); }
function playSelect() { playBeep(440,'square',0.06,0.08); }
function playError()  { playBeep(110,'sawtooth',0.15,0.13); }
function playEnter()  { [330,440,550,660].forEach((f,i)=>setTimeout(()=>playBeep(f,'sine',0.2,0.15),i*60)); }

function startBGMusic() {
  if (!audioCtx || bgMusicRunning) return;
  bgMusicRunning = true;
  const notes = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 233.08, 196.00, 174.61, 155.56];
  const noteLen = 0.17;
  let t = audioCtx.currentTime + 0.1;
  function scheduleChunk() {
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'square'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.035, t + i * noteLen);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * noteLen + noteLen * 0.85);
      osc.start(t + i * noteLen);
      osc.stop(t + i * noteLen + noteLen);
    });
    t += notes.length * noteLen;
  }
  scheduleChunk();
  const loop = setInterval(() => {
    if (!bgMusicRunning) { clearInterval(loop); return; }
    if (t - audioCtx.currentTime < 1.5) scheduleChunk();
  }, 500);
}

// ── Constants ───────────────────────────────────────────────
const TILE  = 40;
const COLS  = 60;
const ROWS  = 60;

const T = { GRASS:0, PATH:1, WATER:2, WALL:3, DOOR:4, FLOWER:5, TREE:6, SAND:7, STONE:8, DEEP_WATER:9, LAVA:10, SNOW:11, COBBLE:12 };

// ── Map Generation ────────────────────────────────────────
// Build a 60×60 map programmatically

function buildMap() {
  // Initialize all grass
  const map = Array.from({length:ROWS}, () => Array(COLS).fill(T.GRASS));
  const col = Array.from({length:ROWS}, () => Array(COLS).fill(0));

  // Border walls
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    if(r===0||r===ROWS-1||c===0||c===COLS-1) { map[r][c]=T.WALL; col[r][c]=1; }
  }

  // Main cross paths
  for(let r=0;r<ROWS;r++) { map[r][29]=T.PATH; map[r][30]=T.PATH; col[r][29]=0; col[r][30]=0; }
  for(let c=0;c<COLS;c++) { map[29][c]=T.PATH; map[30][c]=T.PATH; col[29][c]=0; col[30][c]=0; }

  // Diagonal scenic paths
  for(let i=5;i<20;i++) { map[i][i+5]=T.PATH; col[i][i+5]=0; }
  for(let i=5;i<20;i++) { map[i][COLS-i-6]=T.PATH; col[i][COLS-i-6]=0; }
  for(let i=35;i<52;i++) { map[i][i-10]=T.PATH; col[i][i-10]=0; }

  // Central plaza (around 29-30, 29-30) — cobblestone circle
  for(let r=25;r<=34;r++) for(let c=25;c<=34;c++) {
    const dr=r-29.5, dc=c-29.5;
    if(dr*dr+dc*dc<=28) { map[r][c]=T.COBBLE; col[r][c]=0; }
  }

  // ── BUILDING HELPER ──
  function placeBuilding(tr,tc,h,w,doorRow,doorCol) {
    for(let r=tr;r<tr+h;r++) for(let c=tc;c<tc+w;c++) {
      if(r===tr||r===tr+h-1||c===tc||c===tc+w-1) {
        map[r][c]=T.WALL; col[r][c]=1;
      } else {
        map[r][c]=T.STONE; col[r][c]=1;
      }
    }
    map[doorRow][doorCol]=T.DOOR; col[doorRow][doorCol]=0;
    // Stone path to door
    const mid=(tc+tc+w)/2|0;
    for(let d=0;d<4;d++) {
      const r2=(doorRow>29)?doorRow+d:doorRow-d;
      if(r2>0&&r2<ROWS) { map[r2][doorCol]=T.PATH; col[r2][doorCol]=0; }
    }
  }

  // 6 Buildings placed in quadrants
  // ABOUT (NW)
  placeBuilding(5,5,10,10,14,10);
  // PROJECTS (NE)
  placeBuilding(5,44,10,10,14,49);
  // SKILLS (W)
  placeBuilding(25,3,8,9,28,11);
  // CONTACT (E)
  placeBuilding(25,47,8,9,28,47);
  // EXPERIENCE (SW)
  placeBuilding(44,5,10,10,44,10);
  // EDUCATION (SE)
  placeBuilding(44,44,10,10,44,49);
  // BLOG TAVERN (Center-S)
  placeBuilding(38,26,6,8,43,29);

  // Water lake — top-right area
  for(let r=8;r<=18;r++) for(let c=32;c<=44;c++) {
    const dr=r-13,dc=c-38;
    if(dr*dr*1.2+dc*dc<=38) { map[r][c]=T.WATER; col[r][c]=1; }
  }
  // Deep water center
  for(let r=10;r<=16;r++) for(let c=34;c<=42;c++) {
    const dr=r-13,dc=c-38;
    if(dr*dr+dc*dc<=15) { map[r][c]=T.DEEP_WATER; col[r][c]=1; }
  }

  // Water lake — bottom-left
  for(let r=38;r<=50;r++) for(let c=15;c<=25;c++) {
    const dr=r-44,dc=c-20;
    if(dr*dr*1.3+dc*dc<=40) { map[r][c]=T.WATER; col[r][c]=1; }
  }

  // Flower meadow areas
  const flowerZones=[[3,15,8,28],[3,32,8,42],[50,3,58,15],[50,42,58,58]];
  flowerZones.forEach(([r1,c1,r2,c2])=>{
    for(let r=r1;r<r2;r++) for(let c=c1;c<c2;c++) {
      if(map[r][c]===T.GRASS && Math.random()<0.35) { map[r][c]=T.FLOWER; }
    }
  });

  // Tree forests
  const treeZones=[[2,2,8,4],[2,53,8,57],[50,2,57,7],[50,52,57,57],[14,15,26,25],[14,35,26,43]];
  treeZones.forEach(([r1,c1,r2,c2])=>{
    for(let r=r1;r<r2;r++) for(let c=c1;c<c2;c++) {
      if(map[r][c]===T.GRASS && Math.random()<0.6) { map[r][c]=T.TREE; col[r][c]=1; }
    }
  });

  // Sandy beach around lakes
  const beachPositions=[
    [7,31],[7,32],[7,43],[7,44],[18,31],[18,43],[19,32],[19,42],
    [37,14],[37,25],[51,14],[51,25],[52,15],[52,24]
  ];
  beachPositions.forEach(([r,c])=>{ if(map[r][c]===T.GRASS||map[r][c]===T.FLOWER) map[r][c]=T.SAND; });

  // Snow tundra (top strip)
  for(let r=1;r<=3;r++) for(let c=1;c<COLS-1;c++) {
    if(map[r][c]===T.GRASS||map[r][c]===T.FLOWER) { map[r][c]=T.SNOW; col[r][c]=0; }
  }

  // Stone outcrops
  const stoneSpots=[[20,5],[20,6],[21,5],[35,52],[35,53],[36,52],[15,29],[15,31],[45,29]];
  stoneSpots.forEach(([r,c])=>{ map[r][c]=T.STONE; col[r][c]=1; });

  return {map,col};
}

const { map: MAP_TILES, col: COLLISION } = buildMap();

// ── Building Definitions ─────────────────────────────────
const BUILDINGS = [
  { id:'about',      tx:10, ty:14, label:'ABOUT ME',     icon:'🏠', color:'#4af7c4', desc:'Learn about Rahul' },
  { id:'projects',   tx:49, ty:14, label:'PROJECTS LAB', icon:'🔬', color:'#f7c44a', desc:'See his projects' },
  { id:'skills',     tx:11, ty:28, label:'SKILLS DOJO',  icon:'⚔️', color:'#c47af7', desc:'Tech skills' },
  { id:'contact',    tx:47, ty:28, label:'CONTACT',      icon:'📡', color:'#4ab4f7', desc:'Get in touch' },
  { id:'experience', tx:10, ty:44, label:'EXPERIENCE',   icon:'🏛️', color:'#f76450', desc:'Work history' },
  { id:'education',  tx:49, ty:44, label:'LIBRARY',      icon:'📚', color:'#4af796', desc:'Education & certs' },
  { id:'blog',       tx:29, ty:43, label:'DEV TAVERN',   icon:'🍺', color:'#f7a050', desc:'Blog & writing' },
];

// ── NPC Definitions ──────────────────────────────────────
const NPC_DEFS = [
  {
    id:'elder', tx:29, ty:26, color:'#e0a030', hatColor:'#8b4513', name:'Village Elder', questId:'q1',
    portrait:'👴',
    dialogue:[
      "Welcome, traveller, to Rahul Raj Singh's portfolio.",
      "He’s a BTech CS student at VIT Chennai, building AI-powered robots and compilers.",
      "Explore all 7 halls to discover his journey, skills, and projects.",
      "Take this Resume Scroll — it holds his stats.",
      "Quest: The Resume Scroll — ACCEPTED!",
    ],
    giveItem: 'Resume Scroll',
  },
  {
    id:'recruiter', tx:30, ty:33, color:'#c050e8', hatColor:'#601090', name:'Recruiter Rex', questId:null,
    portrait:'💼',
    dialogue:["Hey! I've placed data analysts & ML engineers across 3 continents.","Rahul's work on computer vision and data dashboards is top-notch.","What brings you here today?"],
    choices:[
      { label:'💼 Let\'s hire him!', next:'hire' },
      { label:'🛠 Show his stack', next:'skills' },
      { label:'💰 What\'s the rate?', next:'rate' },
    ],
    choiceDialogue:{
      hire:  ["Excellent taste! Reach him at rahulrajsingh.work.15072005@gmail.com", "Open for internships, entry-level roles, and freelance data work. Let's build!"],
      skills:["Languages: Python, C++, SQL, JavaScript","Data tools: pandas, NumPy, scikit-learn, Power BI, Looker Studio","Embedded: Raspberry Pi, OpenCV, GPIO"],
      rate:  ["Competitive student rates — first consultation always free!","Drop an email for a detailed proposal."],
    },
  },
  {
    id:'qa', tx:29, ty:34, color:'#40c870', hatColor:'#206040', name:'QA Quinn', questId:'q2',
    portrait:'🐛',
    dialogue:["HALT! The Bug Gate is sealed until you prove your data skills!", "Face the Data Analyst Quiz. 3 questions. No Googling.", "Pass 2/3 and earn the Python Badge. Ready?"],
    triggerQuiz: true,
  },
  {
    id:'mentor', tx:22, ty:30, color:'#50a0f0', hatColor:'#205080', name:'Mentor Max', questId:null,
    portrait:'👨‍🏫',
    dialogue:[
      "Every master was once a disaster. Rahul started with simple Python scripts.",
      "He built a Compiler Visualiser from scratch, taught 200+ students, and contributed to open‑source.",
      "His GitHub: github.com/rahulrajsinghwork15072005-a11y — 10+ pinned projects.",
      "PRO TIP: Visit all 7 buildings to unlock the Secret Data Badge! 🏆",
    ],
  },
  {
    id:'designer', tx:37, ty:30, color:'#f06080', hatColor:'#801030', name:'Designer Dana', questId:null,
    portrait:'🎨',
    dialogue:[
      "Pixel-perfect UI isn't an accident — and Rahul’s web projects prove it.",
      "From a retro WebOS XP to a full RPG world, he crafts every detail with vanilla code.",
      "Check the Projects Lab to see his 10 featured creations!",
    ],
  },
  {
    id:'devops_dude', tx:29, ty:20, color:'#f0a040', hatColor:'#805010', name:'DevOps Dave', questId:null,
    portrait:'🐳',
    dialogue:[
      "Welcome to the infrastructure district!",
      "Rahul’s projects are often PWAs, deployed on Vercel/Netlify with CI/CD.",
      "He uses GitHub Actions for automation and Docker for reproducibility.",
      "99.99% uptime on his live demos.",
    ],
  },
  {
    id:'ai_scholar', tx:22, ty:40, color:'#80f0c0', hatColor:'#306050', name:'AI Scholar Ada', questId:'q4',
    portrait:'🤖',
    dialogue:[
      "Ah, a visitor to the AI research wing!",
      "Rahul built a Text-to-Braille system using an SVM + Raspberry Pi — 92% accuracy!",
      "He also codes in Python for ML, scikit-learn, and computer vision.",
      "Would you like to attempt the AI Knowledge Challenge?",
    ],
    triggerAiQuiz: true,
  },
  {
    id:'open_source_fairy', tx:37, ty:40, color:'#f0e040', hatColor:'#806010', name:'OSS Fairy Fern', questId:null,
    portrait:'🧚',
    dialogue:[
      "Psst! Over here!",
      "Rahul open-sources many of his tools — from compilers to mockup generators.",
      "His npm packages? Not yet, but he’s ready!",
      "Collect all 5 Tech Orbs to complete the Full Stack quest!",
    ],
  },
  {
    id:'historian', tx:29, ty:27, color:'#d0a080', hatColor:'#704020', name:'World Historian', questId:null,
    portrait:'📜',
    dialogue:[
      "Greetings! I chronicle Rahul’s journey.",
      "This 60×60 world contains 10 projects, 4 internships, and a decade of schooling.",
      "Press [M] to open the World Map and plan your adventure!",
    ],
  },
];

// ── Tech Orbs ─────────────────────────────────────────────
const ORB_DEFS = [
  { id:'orb_python', tx:8,  ty:20, label:'Python Orb',     icon:'🔮', color:'#306998' },
  { id:'orb_sql',    tx:50, ty:20, label:'SQL Orb',        icon:'🔮', color:'#f29111' },
  { id:'orb_openCV', tx:8,  ty:40, label:'OpenCV Orb',     icon:'🔮', color:'#5c3e9c' },
  { id:'orb_cpp',    tx:50, ty:40, label:'C++ Orb',        icon:'🔮', color:'#00599c' },
  { id:'orb_data',   tx:29, ty:10, label:'Data Science Orb', icon:'🔮', color:'#f05030' },
];

// ── Bonus Items ───────────────────────────────────────────
const EXTRA_ITEMS = [
  { id:'coffee',   tx:31, ty:28, label:'Coffee Cup',      icon:'☕', color:'#8b5e3c' },
  { id:'badge',    tx:15, ty:50, label:'Data Badge',      icon:'🏅', color:'#f0d040' },
  { id:'scroll2',  tx:45, ty:10, label:'Resume Scroll',   icon:'📋', color:'#a0c8f0' },
  { id:'gem',      tx:55, ty:50, label:'Crystal Gem',     icon:'💎', color:'#80e8f8' },
];

// ── Quiz Questions (data-oriented) ─────────────────────────
const QUIZ_QUESTIONS = [
  { q:"What pandas method loads a CSV file?", opts:["pd.read_csv()","pd.load_csv()","pd.open_csv()","pd.csv_reader()"], ans:0 },
  { q:"Which SQL keyword retrieves data?", opts:["INSERT","SELECT","UPDATE","EXTRACT"], ans:1 },
  { q:"What is the output of `print(2**3)` in Python?", opts:["6","8","9","Error"], ans:1 },
  { q:"What does scikit-learn provide?", opts:["Web framework","Machine learning tools","Database connector","CSS framework"], ans:1 },
  { q:"Which library is used for computer vision in Python?", opts:["NumPy","OpenCV","Matplotlib","Requests"], ans:1 },
];

const AI_QUIZ_QUESTIONS = [
  { q:"What does RAG stand for in AI?", opts:["Random Access Generation","Retrieval Augmented Generation","Recursive AI Graph","Real-time Agent Gateway"], ans:1 },
  { q:"Which company made the GPT series of models?", opts:["Google","Meta","OpenAI","Anthropic"], ans:2 },
  { q:"What is a 'token' in the context of LLMs?", opts:["An API key","A unit of text processed by the model","A reward in training","A database entry"], ans:1 },
];

// ── Particles System ──────────────────────────────────────
let particles = [];

function spawnParticles(x, y, count, color='#4af7c4') {
  for(let i=0;i<count;i++) {
    const angle = Math.random()*Math.PI*2;
    const speed = 1+Math.random()*3;
    particles.push({ x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-2, life:1, color, size:2+Math.random()*3 });
  }
}

function updateParticles(dt) {
  for(let i=particles.length-1;i>=0;i--) {
    const p=particles[i];
    p.x+=p.vx*(dt/16); p.y+=p.vy*(dt/16);
    p.vy+=0.08*(dt/16);
    p.life-=0.02*(dt/16);
    if(p.life<=0) particles.splice(i,1);
  }
}

function drawParticles() {
  particles.forEach(p=>{
    ctx.save();
    ctx.globalAlpha=p.life;
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x-p.size/2, p.y-p.size/2, p.size, p.size);
    ctx.restore();
  });
}

// ── Weather System ────────────────────────────────────────
const WEATHERS = ['clear','cloudy','rain','snow','storm'];
let weatherParticles = [];
let currentWeather = 'clear';
let weatherTimer = 0;
const WEATHER_CHANGE_INTERVAL = 90; // seconds

function updateWeather(dt) {
  weatherTimer += dt/1000;
  if(weatherTimer > WEATHER_CHANGE_INTERVAL) {
    weatherTimer = 0;
    const idx = Math.floor(Math.random()*WEATHERS.length);
    currentWeather = WEATHERS[idx];
    updateWeatherHUD();
    if(currentWeather==='rain'||currentWeather==='storm') spawnWeatherParticles();
    else if(currentWeather==='snow') spawnSnowParticles();
    else weatherParticles=[];
  }
  // Update weather particles
  for(let i=weatherParticles.length-1;i>=0;i--) {
    const p=weatherParticles[i];
    p.x+=p.vx*(dt/16); p.y+=p.vy*(dt/16);
    if(p.y>canvas.height+10) {
      p.y=-5; p.x=Math.random()*canvas.width;
    }
  }
}

function spawnWeatherParticles() {
  weatherParticles=[];
  const n=currentWeather==='storm'?200:100;
  for(let i=0;i<n;i++) {
    weatherParticles.push({ x:Math.random()*2000-100, y:Math.random()*canvas.height, vx:currentWeather==='storm'?2:0.5, vy:4+Math.random()*4, color:'rgba(180,220,255,0.6)', size:1.5 });
  }
}

function spawnSnowParticles() {
  weatherParticles=[];
  for(let i=0;i<80;i++) {
    weatherParticles.push({ x:Math.random()*2000, y:Math.random()*canvas.height, vx:Math.sin(i)*0.5, vy:0.8+Math.random()*1.2, color:'rgba(220,240,255,0.8)', size:2+Math.random()*2 });
  }
}

function drawWeather() {
  if(weatherParticles.length===0) return;
  ctx.save();
  weatherParticles.forEach(p=>{
    ctx.fillStyle=p.color;
    if(currentWeather==='snow'||currentWeather==='rain'||currentWeather==='storm') {
      ctx.fillRect(p.x, p.y, p.size, currentWeather==='snow'?p.size:p.size*3);
    }
  });
  if(currentWeather==='storm') {
    ctx.fillStyle='rgba(100,100,160,0.08)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  ctx.restore();
}

function updateWeatherHUD() {
  const icons = {clear:'☀️',cloudy:'⛅',rain:'🌧️',snow:'❄️',storm:'⛈️'};
  document.getElementById('weather-icon').textContent = icons[currentWeather]||'☀️';
}

// ── Location Zones (Rahul's naming) ────────────────────────
const LOCATION_ZONES = [
  { x1:0,  y1:0,  x2:30, y2:30, name:'Rahul\'s Northern Forest' },
  { x1:30, y1:0,  x2:60, y2:30, name:'Crystal Lake District' },
  { x1:0,  y1:30, x2:30, y2:60, name:'Data Valley' },
  { x1:30, y1:30, x2:60, y2:60, name:'Robotics Quarter' },
  { x1:20, y1:20, x2:40, y2:40, name:'Portfolio Plaza' },
  { x1:3,  y1:3,  x2:17, y2:17, name:'Home District' },
  { x1:42, y1:3,  x2:58, y2:17, name:'Projects Quadrant' },
  { x1:22, y1:35, x2:38, y2:48, name:'Blog Tavern Alley' },
  { x1:3,  y1:42, x2:17, y2:57, name:'Experience Hall' },
  { x1:42, y1:42, x2:58, y2:57, name:'Education District' },
];

function getLocationName(tx, ty) {
  let best = 'Dev Village XL';
  let bestSize = Infinity;
  for(const z of LOCATION_ZONES) {
    if(tx>=z.x1&&tx<z.x2&&ty>=z.y1&&ty<z.y2) {
      const size=(z.x2-z.x1)*(z.y2-z.y1);
      if(size<bestSize) { best=z.name; bestSize=size; }
    }
  }
  return best;
}

// ── XP / Level system ────────────────────────────────────
const LEVEL_XP = [0, 100, 250, 500, 900, 1500, 2500];

function addXP(amount) {
  G.player.xp = (G.player.xp||0)+amount;
  const lv = G.player.devLevel;
  if(lv<LEVEL_XP.length-1 && G.player.xp >= LEVEL_XP[lv]) {
    G.player.devLevel++;
    showToast(`🆙 LEVEL UP! Dev Level ${G.player.devLevel}!`);
    spawnParticles(canvas.width/2, canvas.height/2, 30, '#f7c44a');
    updateHUD();
  }
  const xpFill = document.getElementById('xp-bar-fill');
  if(xpFill && lv<LEVEL_XP.length-1) {
    const pct = ((G.player.xp - LEVEL_XP[lv-1]||0) / (LEVEL_XP[lv]-LEVEL_XP[lv-1]||100))*100;
    xpFill.style.width = Math.min(100,pct)+'%';
  }
}

// ── GAME STATE ────────────────────────────────────────────
let G = {
  player: {
    tx:29, ty:32, px:0, py:0,
    moving:false, dir:'down',
    animFrame:0, animTimer:0,
    shirtColor:'#4af7c4',
    devLevel:1, xp:0, coins:0, hp:100,
    startPx:0, startPy:0, targetPx:0, targetPy:0,
    moveTimer:0, moveDuration:140,
  },
  cam: { x:0, y:0 },
  npcs: [],
  mapItems: [],
  inventory: [],
  visitedBuildings: new Set(),
  quests: {
    q1: { name:'The Resume Scroll',   desc:'Talk to the Village Elder', status:'active', reward:'Resume Scroll' },
    q2: { name:'Bug Squasher',        desc:'Pass the Data Quiz (2/3)',    status:'locked', reward:'Python Badge' },
    q3: { name:'Full Stack Delivery', desc:'Collect all 5 Tech Orbs',   status:'active', progress:0, total:5 },
    q4: { name:'AI Apprentice',       desc:'Find Ada & pass AI Quiz',   status:'locked', reward:'AI Badge' },
    q5: { name:'World Explorer',      desc:'Visit all 7 buildings',     status:'active', progress:0, total:7, reward:'Explorer Crown' },
  },
  dayTime:0, dayTimer:0, DAY_CYCLE:180,
  keys:{}, keyJustPressed:{},
  dlg:{ open:false, speaker:'', lines:[], lineIdx:0, text:'', typeTimer:0, charIdx:0, choices:null, choiceIdx:0, showChoices:false, npcId:null },
  paused:false, questOpen:false, invOpen:false, quizOpen:false, mapOpen:false,
  quizState:null, activeQuizType:'main',
  started:false, lastTime:0,
  doorstepBuilding:null,
};

// ── DOM References ─────────────────────────────────────────
const canvas    = document.getElementById('gameCanvas');
const ctx       = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const mmCtx     = minimapCanvas ? minimapCanvas.getContext('2d') : null;

const startScreen = document.getElementById('start-screen');
const startBtn    = document.getElementById('start-btn');
const hud         = document.getElementById('hud');
const hudLevel    = document.getElementById('hud-level');
const hudQuestBar = document.getElementById('hud-quest-bar');
const dlgBox      = document.getElementById('dialogue-box');
const dlgSpeaker  = document.getElementById('dlg-speaker');
const dlgText     = document.getElementById('dlg-text');
const dlgContinue = document.getElementById('dlg-continue');
const dlgChoices  = document.getElementById('dlg-choices');
const dlgPortrait = document.getElementById('dlg-portrait-icon');
const questModal  = document.getElementById('quest-modal');
const invModal    = document.getElementById('inv-modal');
const pauseModal  = document.getElementById('pause-modal');
const quizModal   = document.getElementById('quiz-modal');
const mapModal    = document.getElementById('map-modal');
const toast       = document.getElementById('toast');
const toast2      = document.getElementById('toast2');
const doorPrompt  = document.getElementById('doorstep-prompt');
const minimapContainer = document.getElementById('minimap-container');
const hotbar      = document.getElementById('hotbar');

// ── Canvas Resize ─────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = Math.min(window.innerWidth, 900);
  canvas.height = Math.min(window.innerHeight, 900);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Init ──────────────────────────────────────────────────
function initGame() {
  G.npcs = NPC_DEFS.map(d => ({ ...d, dialogueDone:false }));
  G.mapItems = [
    ...ORB_DEFS.map(o=>({...o, collected:false, type:'orb'})),
    ...EXTRA_ITEMS.map(e=>({...e, collected:false, type:'item'})),
  ];
  G.player.px = G.player.tx * TILE;
  G.player.py = G.player.ty * TILE;
  updateCamera();
  drawAvatarCanvas();
  initStartParticles();
}

function drawAvatarCanvas() {
  const ac = document.getElementById('avatarCanvas');
  if(!ac) return;
  const ac2 = ac.getContext('2d');
  ac2.imageSmoothingEnabled = false;
  const s=2;
  // Simple pixel art avatar
  ac2.fillStyle='#f0c890'; ac2.fillRect(22*s,6*s,18*s,14*s); // head
  ac2.fillStyle='#2a3a60'; ac2.fillRect(18*s,20*s,24*s,12*s); // body
  ac2.fillStyle='#4af7c4'; ac2.fillRect(20*s,20*s,20*s,12*s); // shirt
  ac2.fillStyle='#2a3a60'; ac2.fillRect(22*s,32*s,8*s,8*s); ac2.fillRect(32*s,32*s,8*s,8*s); // legs
  ac2.fillStyle='#1a1a2e'; ac2.fillRect(25*s,10*s,4*s,3*s); ac2.fillRect(33*s,10*s,4*s,3*s); // eyes
  ac2.fillStyle='#2a2a3e'; ac2.fillRect(20*s,4*s,22*s,5*s); ac2.fillRect(23*s,0*s,16*s,6*s); // hat
}

function initStartParticles() {
  const container = document.getElementById('startParticles');
  if(!container) return;
  for(let i=0;i<30;i++) {
    const dot = document.createElement('div');
    const size = 2 + Math.random()*4;
    dot.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:#4af7c4;opacity:${0.1+Math.random()*0.4};left:${Math.random()*100}%;top:${Math.random()*100}%;animation:startParticleFloat ${4+Math.random()*8}s ${Math.random()*5}s ease-in-out infinite alternate`;
    container.appendChild(dot);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes startParticleFloat{from{transform:translate(0,0)}to{transform:translate(${Math.random()>0.5?'':'-'}${10+Math.random()*30}px,${Math.random()>0.5?'':'-'}${10+Math.random()*30}px)}}`;
  document.head.appendChild(style);
}

// ── Camera ────────────────────────────────────────────────
function updateCamera() {
  const p = G.player;
  const tx2 = p.px + TILE/2 - canvas.width/2;
  const ty2 = p.py + TILE/2 - canvas.height/2;
  G.cam.x = Math.max(0, Math.min(COLS*TILE - canvas.width,  tx2));
  G.cam.y = Math.max(0, Math.min(ROWS*TILE - canvas.height, ty2));
}

// ── Input ─────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if(!G.started) return;
  initAudio(); startBGMusic();
  G.keys[e.key]=true;
  G.keyJustPressed[e.key]=true;
  handleInput(e.key);
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { G.keys[e.key]=false; });

function handleInput(key) {
  if(key==='Escape') {
    if(G.dlg.open)   { closeDlg(); return; }
    if(G.questOpen)  { closeModal(questModal); G.questOpen=false; return; }
    if(G.invOpen)    { closeModal(invModal);   G.invOpen=false;   return; }
    if(G.mapOpen)    { closeModal(mapModal);   G.mapOpen=false;   return; }
    const secModal = document.querySelector('.section-modal-overlay.open');
    if(secModal) { secModal.classList.remove('open'); return; }
    if(G.quizOpen)   return;
    G.paused = !G.paused;
    G.paused ? openModal(pauseModal) : closeModal(pauseModal);
    return;
  }
  if(G.paused||G.quizOpen) return;
  if(key==='q'||key==='Q') {
    G.questOpen=!G.questOpen;
    G.questOpen ? (renderQuestLog(), openModal(questModal)) : closeModal(questModal);
    return;
  }
  if(key==='i'||key==='I') {
    G.invOpen=!G.invOpen;
    G.invOpen ? (renderInventory(), openModal(invModal)) : closeModal(invModal);
    return;
  }
  if(key==='m'||key==='M') {
    G.mapOpen=!G.mapOpen;
    G.mapOpen ? (renderWorldMap(), openModal(mapModal)) : closeModal(mapModal);
    return;
  }
  if(G.dlg.open) { handleDialogueInput(key); return; }

  // Enter doorstep
  if((key===' '||key==='e'||key==='E') && G.doorstepBuilding) {
    enterBuilding(G.doorstepBuilding);
    return;
  }
  if(key===' '||key==='e'||key==='E') { tryInteract(); return; }

  if(!G.player.moving) {
    let dx=0,dy=0;
    if(key==='ArrowUp'   ||key==='w'||key==='W') { dy=-1; G.player.dir='up'; }
    if(key==='ArrowDown' ||key==='s'||key==='S') { dy= 1; G.player.dir='down'; }
    if(key==='ArrowLeft' ||key==='a'||key==='A') { dx=-1; G.player.dir='left'; }
    if(key==='ArrowRight'||key==='d'||key==='D') { dx= 1; G.player.dir='right'; }
    if(dx||dy) tryMove(dx,dy);
  }
}

// ── Movement ──────────────────────────────────────────────
function tryMove(dx, dy) {
  const nx = G.player.tx+dx, ny = G.player.ty+dy;
  if(nx<0||nx>=COLS||ny<0||ny>=ROWS) return;
  if(COLLISION[ny][nx]===1) return;
  if(G.npcs.find(n=>n.tx===nx&&n.ty===ny)) return;
  MAP_TILES[ny][nx]===T.DOOR ? playDoor() : playStep();
  G.player.tx=nx; G.player.ty=ny;
  G.player.moving=true; G.player.moveTimer=0;
  G.player.moveDuration=140;
  G.player.startPx=G.player.px; G.player.startPy=G.player.py;
  G.player.targetPx=nx*TILE;    G.player.targetPy=ny*TILE;
}

// ── Doorstep Detection ────────────────────────────────────
function checkDoorstep() {
  const {tx,ty} = G.player;
  let found = null;
  for(const b of BUILDINGS) {
    const dist = Math.abs(b.tx-tx) + Math.abs(b.ty-ty);
    if(dist<=2) { found=b; break; }
  }
  if(found !== G.doorstepBuilding) {
    G.doorstepBuilding = found;
    if(found) {
      document.getElementById('doorstep-icon').textContent = found.icon;
      document.getElementById('doorstep-text').textContent = `ENTER ${found.label}`;
      doorPrompt.classList.add('visible');
      doorPrompt.style.display = 'flex';
    } else {
      doorPrompt.classList.remove('visible');
      doorPrompt.style.display = 'none';
    }
  }
  // Update location name
  const locName = getLocationName(tx,ty);
  const locEl = document.getElementById('location-name');
  if(locEl) locEl.textContent = locName;
}

function enterBuilding(building) {
  playEnter();
  const overlay = document.getElementById(`modal-${building.id}`);
  if(overlay) {
    overlay.classList.add('open');
    // Track visit for quest
    if(!G.visitedBuildings.has(building.id)) {
      G.visitedBuildings.add(building.id);
      G.quests.q5.progress++;
      addXP(50);
      showToast(`🏅 Entered ${building.label}! +50 XP`);
      spawnParticles(canvas.width/2, canvas.height*.7, 12, building.color);
      updateHUD();
      if(G.quests.q5.progress>=G.quests.q5.total) {
        G.quests.q5.status='complete';
        addItem({label:'Explorer Crown', icon:'👑', color:'#f7c44a'});
        showToast2('🎉 Quest: World Explorer COMPLETE! 👑');
        addXP(200);
      }
    }
    // Animate skill bars when opening skills modal
    if(building.id==='skills') {
      setTimeout(animateSkillBars, 300);
      initSkillTabs();
    }
    if(building.id==='projects') initProjectFilters();
  } else {
    // Fallback: dialogue
    showBuildingDialogue(building);
  }
}

function animateSkillBars() {
  document.querySelectorAll('.sk-fill').forEach(el=>{
    const w = el.style.width;
    el.style.width='0%';
    setTimeout(()=>{ el.style.width=w; },50);
  });
}

function initSkillTabs() {
  document.querySelectorAll('.skill-tab').forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll('.skill-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.skill-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-'+btn.dataset.tab);
      if(panel) { panel.classList.add('active'); animateSkillBars(); }
      playSelect();
    };
  });
}

function initProjectFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card=>{
        const tags = card.dataset.tags||'';
        card.classList.toggle('hidden', filter!=='all' && !tags.includes(filter));
      });
      playSelect();
    };
  });
}

// ── Interaction ────────────────────────────────────────────
function tryInteract() {
  const adjacent=[[0,-1],[0,1],[-1,0],[1,0]];
  let targetNpc=null;
  for(const [ax,ay] of adjacent) {
    const npc=G.npcs.find(n=>n.tx===G.player.tx+ax&&n.ty===G.player.ty+ay);
    if(npc) { targetNpc=npc; break; }
  }
  if(targetNpc) { startDialogue(targetNpc); return; }
}

// ── Dialogue System ────────────────────────────────────────
function startDialogue(npc) {
  playSelect();
  const d=G.dlg;
  d.open=true; d.speaker=npc.name; d.npcId=npc.id;
  d.lines=[...npc.dialogue]; d.lineIdx=0; d.charIdx=0; d.text='';
  d.choices=npc.choices||null; d.choiceIdx=0; d.showChoices=false;
  if(dlgPortrait) dlgPortrait.textContent=npc.portrait||'👤';
  dlgBox.style.display='flex';
  dlgChoices.innerHTML=''; dlgChoices.style.display='none';
  renderDlgLine();
  if(npc.questId==='q2' && G.quests.q2.status==='locked') G.quests.q2.status='active';
  if(npc.questId==='q4' && G.quests.q4.status==='locked') G.quests.q4.status='active';
}

// ── Updated showBuildingDialogue with Rahul's info ────────
function showBuildingDialogue(building) {
  const content = {
    about:      ["🏠 ABOUT RAHUL","BTech CS @ VIT Chennai · 2027","Data analyst, ML enthusiast, roboticist.","Built 10+ projects, 3 internships, led a tech team."],
    projects:   ["🔬 PROJECTS LAB","10 featured projects — compilers, OS simulators, RPGs…","Languages: Python, C++, JS. Hardware: Raspberry Pi, OpenCV.","Click a building to see the full list!"],
    skills:     ["⚔️ SKILLS DOJO","Python, C++, SQL, pandas, scikit-learn, Power BI, Looker","Also: React/Next.js, Git, AWS, Docker","Proficiency bars inside show real‑world experience."],
    contact:    ["📡 CONTACT TERMINAL","Email: rahulrajsingh.work.15072005@gmail.com","Phone: +91 89256 95503","LinkedIn & GitHub inside. Response under 24h!"],
    experience: ["🏛️ EXPERIENCE HALL","4 internship‑level roles — AI robotics lead, data analyst intern, club manager.","Highlights: 92% SVM accuracy, 28% traffic boost, 45% engagement lift."],
    education:  ["📚 THE LIBRARY","VIT Chennai (BTech CSE), 90.2% in XII, 94.2% in X","Currently exploring: Data‑Intensive Applications, Pragmatic Programmer"],
    blog:       ["🍺 DEV TAVERN","Rahul writes occasionally about compilers, web dev, and data science.","No official blog yet, but subscribe to his newsletter for updates!"],
  };
  const lines = content[building.id]||["Welcome to "+building.label];
  G.dlg.open=true; G.dlg.speaker=`${building.icon} ${building.label}`; G.dlg.npcId=null;
  G.dlg.lines=lines; G.dlg.lineIdx=0; G.dlg.charIdx=0; G.dlg.text='';
  G.dlg.choices=null; G.dlg.showChoices=false;
  if(dlgPortrait) dlgPortrait.textContent=building.icon;
  dlgBox.style.display='flex';
  dlgChoices.innerHTML=''; dlgChoices.style.display='none';
  renderDlgLine(); playDoor();
}

function renderDlgLine() {
  const d=G.dlg;
  dlgSpeaker.textContent=d.speaker;
  dlgText.textContent='';
  d.text=d.lines[d.lineIdx]; d.charIdx=0;
  dlgContinue.style.display='none'; dlgChoices.style.display='none'; dlgChoices.innerHTML='';
}

function tickDialogueType(dt) {
  const d=G.dlg;
  if(!d.open||d.showChoices) return;
  d.typeTimer=(d.typeTimer||0)+dt;
  if(d.typeTimer>=25) {
    d.typeTimer=0;
    if(d.charIdx<d.text.length) {
      d.charIdx++;
      dlgText.textContent=d.text.slice(0,d.charIdx);
    } else {
      const isLast=d.lineIdx>=d.lines.length-1;
      if(isLast && d.choices && !d.showChoices) {
        d.showChoices=true; dlgContinue.style.display='none'; renderChoices();
      } else {
        dlgContinue.style.display='block';
      }
    }
  }
}

function renderChoices() {
  const d=G.dlg;
  dlgChoices.style.display='flex'; dlgChoices.innerHTML='';
  d.choices.forEach((c,i)=>{
    const el=document.createElement('div');
    el.className='dlg-choice'+(i===d.choiceIdx?' selected':'');
    el.innerHTML=`<span class="arrow">${i===d.choiceIdx?'▶':'　'}</span> ${c.label}`;
    el.addEventListener('click',()=>{ d.choiceIdx=i; confirmChoice(); });
    dlgChoices.appendChild(el);
  });
}

function handleDialogueInput(key) {
  const d=G.dlg;
  if(d.charIdx<d.text.length) { d.charIdx=d.text.length; dlgText.textContent=d.text; return; }
  if(d.showChoices) {
    if(key==='ArrowUp'||key==='w'||key==='W')   { d.choiceIdx=Math.max(0,d.choiceIdx-1); renderChoices(); playSelect(); }
    if(key==='ArrowDown'||key==='s'||key==='S') { d.choiceIdx=Math.min(d.choices.length-1,d.choiceIdx+1); renderChoices(); playSelect(); }
    if(key===' '||key==='Enter'||key==='e'||key==='E') confirmChoice();
    return;
  }
  if(key===' '||key==='Enter'||key==='e'||key==='E') advanceDlg();
}

function confirmChoice() {
  const d=G.dlg;
  const choice=d.choices[d.choiceIdx];
  playSelect();
  const npc=G.npcs.find(n=>n.id===d.npcId);
  if(npc&&npc.choiceDialogue&&npc.choiceDialogue[choice.next]) {
    d.lines=npc.choiceDialogue[choice.next]; d.lineIdx=0; d.choices=null; d.showChoices=false;
    dlgChoices.style.display='none'; renderDlgLine();
  } else { closeDlg(); }
}

function advanceDlg() {
  const d=G.dlg;
  d.lineIdx++;
  if(d.lineIdx>=d.lines.length) { finishDialogue(); closeDlg(); return; }
  renderDlgLine();
}

function finishDialogue() {
  const d=G.dlg;
  const npcDef=NPC_DEFS.find(n=>n.id===d.npcId);
  if(!npcDef) return;
  if(npcDef.id==='elder' && G.quests.q1.status==='active') {
    G.quests.q1.status='complete';
    addItem({label:'Resume Scroll',icon:'📜',color:'#e8d0a0'});
    G.player.devLevel=Math.max(G.player.devLevel,2);
    addXP(100);
    showToast('Quest Complete: Resume Scroll! 🎉');
    updateHUD();
  }
  if(npcDef.id==='qa' && G.quests.q2.status==='active') setTimeout(()=>startQuiz('main'),200);
  if(npcDef.id==='ai_scholar' && G.quests.q4.status==='active') setTimeout(()=>startQuiz('ai'),200);
}

function closeDlg() {
  G.dlg.open=false; dlgBox.style.display='none'; dlgChoices.innerHTML='';
}

// ── Quest Log ─────────────────────────────────────────────
function renderQuestLog() {
  const container=document.getElementById('quest-list');
  container.innerHTML='';
  Object.entries(G.quests).forEach(([id,q])=>{
    const div=document.createElement('div');
    div.className=`quest-item ${q.status}`;
    let badge='';
    if(q.status==='active')   badge='<span class="quest-status-badge badge-active">ACTIVE</span>';
    if(q.status==='complete') badge='<span class="quest-status-badge badge-done">DONE ✓</span>';
    if(q.status==='locked')   badge='<span class="quest-status-badge badge-locked">LOCKED</span>';
    let prog='';
    if(q.progress!==undefined) {
      const pct=(q.progress/q.total)*100;
      prog=`<div class="quest-progress">Progress: ${q.progress}/${q.total}</div><div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>`;
    }
    div.innerHTML=`<div class="quest-name">${q.name} ${badge}</div><div class="quest-desc">${q.desc}</div>${prog}`;
    container.appendChild(div);
  });
}

// ── Inventory ─────────────────────────────────────────────
function addItem(item) {
  if(G.inventory.length>=12) { showToast('Inventory full! (max 12)'); return; }
  G.inventory.push(item);
  updateHotbar();
}

function renderInventory() {
  const grid=document.getElementById('inventory-grid');
  grid.innerHTML='';
  for(let i=0;i<12;i++) {
    const slot=document.createElement('div');
    const item=G.inventory[i];
    if(item) {
      slot.className='inv-slot filled';
      slot.innerHTML=`<span class="item-icon">${item.icon||'📦'}</span><span class="item-name">${item.label}</span>`;
    } else {
      slot.className='inv-slot empty';
      slot.innerHTML=`<span class="item-name">—</span>`;
    }
    grid.appendChild(slot);
  }
}

function updateHotbar() {
  for(let i=0;i<6;i++) {
    const slot=document.getElementById(`hotbar-${i}`);
    if(!slot) continue;
    const item=G.inventory[i];
    slot.innerHTML=`<span class="slot-num">${i+1}</span>`;
    if(item) {
      slot.classList.add('filled');
      const icon=document.createElement('span');
      icon.style.fontSize='22px'; icon.textContent=item.icon||'📦';
      slot.appendChild(icon);
    } else {
      slot.classList.remove('filled');
    }
  }
}

// ── Item Pickup ───────────────────────────────────────────
function checkItemPickup() {
  G.mapItems.forEach(item=>{
    if(item.collected) return;
    if(item.tx===G.player.tx&&item.ty===G.player.ty) {
      item.collected=true; playPickup();
      const screenX = item.tx*TILE - G.cam.x + TILE/2;
      const screenY = item.ty*TILE - G.cam.y + TILE/2;
      spawnParticles(screenX, screenY, 15, item.color||'#4af7c4');
      if(item.type==='orb') {
        addItem({label:item.label,icon:'🔮',color:item.color});
        G.quests.q3.progress++;
        addXP(75);
        showToast(`🔮 Picked up ${item.label}! +75 XP`);
        if(G.quests.q3.progress>=G.quests.q3.total) {
          G.quests.q3.status='complete';
          G.player.devLevel=Math.max(G.player.devLevel,4);
          addItem({label:'Full Stack Crown',icon:'👑',color:'#4af7c4'});
          showToast2('Quest Complete: Full Stack Delivery! 👑');
          addXP(300);
        }
      } else {
        addItem({label:item.label,icon:item.icon||'📦',color:item.color});
        addXP(25);
        showToast(`Picked up ${item.label}! ☕ +25 XP`);
      }
      updateHUD();
    }
  });
}

// ── Quiz System ───────────────────────────────────────────
function startQuiz(type='main') {
  G.quizOpen=true; G.activeQuizType=type;
  const qs = type==='ai' ? AI_QUIZ_QUESTIONS : QUIZ_QUESTIONS;
  G.quizState={ qIdx:0, score:0, answered:false, questions:qs };
  renderQuiz(); openModal(quizModal);
}

function renderQuiz() {
  const qs=G.quizState;
  const q=qs.questions[qs.qIdx];
  const container=document.getElementById('quiz-content');
  container.innerHTML=`
    <div class="quiz-progress">Question ${qs.qIdx+1} / ${qs.questions.length}</div>
    <div class="quiz-question">${q.q}</div>
    ${q.opts.map((o,i)=>`<button class="quiz-opt" data-idx="${i}" onclick="answerQuiz(${i})"><span>${String.fromCharCode(65+i)}.</span> ${o}</button>`).join('')}
  `;
}

function answerQuiz(idx) {
  if(G.quizState.answered) return;
  G.quizState.answered=true;
  const q=G.quizState.questions[G.quizState.qIdx];
  document.querySelectorAll('.quiz-opt').forEach((b,i)=>{
    b.disabled=true;
    if(i===q.ans) b.classList.add('correct');
    else if(i===idx&&idx!==q.ans) b.classList.add('wrong');
  });
  if(idx===q.ans) { G.quizState.score++; playPickup(); }
  else playError();
  setTimeout(()=>{
    G.quizState.qIdx++; G.quizState.answered=false;
    G.quizState.qIdx>=G.quizState.questions.length ? showQuizResult() : renderQuiz();
  },900);
}

function showQuizResult() {
  const qs=G.quizState;
  const needed = G.activeQuizType==='ai'?2:2;
  const passed=qs.score>=needed;
  if(passed) {
    if(G.activeQuizType==='main') {
      G.quests.q2.status='complete';
      addItem({label:'Python Badge',icon:'🐍',color:'#306998'});
      G.player.devLevel=Math.max(G.player.devLevel,3);
      addXP(150);
      showToast('Quest Complete: Bug Squasher! 🐍');
    } else {
      G.quests.q4.status='complete';
      addItem({label:'AI Badge',icon:'🤖',color:'#80f0c0'});
      G.player.devLevel=Math.max(G.player.devLevel,5);
      addXP(200);
      showToast('Quest Complete: AI Apprentice! 🤖');
    }
    updateHUD();
    spawnParticles(canvas.width/2, canvas.height/2, 40, '#4af7c4');
  }
  document.getElementById('quiz-content').innerHTML=`
    <div class="quiz-result">${passed?'✅ PASSED!':'❌ FAILED!'}<br>Score: ${qs.score}/${qs.questions.length}<br><br>${passed?'Badge earned! Check your inventory.':'Score '+needed+'/'+qs.questions.length+' to pass.'}</div>
    <button class="quiz-opt" style="margin-top:14px" onclick="closeQuiz()">▶ Continue</button>
  `;
}

function closeQuiz() { G.quizOpen=false; closeModal(quizModal); }

// ── World Map Render ──────────────────────────────────────
function renderWorldMap() {
  const wmc=document.getElementById('worldMapCanvas');
  if(!wmc) return;
  const wc=wmc.getContext('2d');
  const W=wmc.width, H=wmc.height;
  const tw=W/COLS, th=H/ROWS;
  const tileColors={
    [T.GRASS]:'#1a4020',[T.PATH]:'#6a4820',[T.WATER]:'#1a3868',[T.DEEP_WATER]:'#0d2040',
    [T.WALL]:'#1a1a25',[T.DOOR]:'#6b4018',[T.TREE]:'#0d3010',[T.STONE]:'#303040',
    [T.FLOWER]:'#2a5030',[T.SAND]:'#8a6040',[T.SNOW]:'#d0e8f0',[T.COBBLE]:'#4a4a60',
    [T.LAVA]:'#8a2010',
  };
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    wc.fillStyle=tileColors[MAP_TILES[r][c]]||'#1a4020';
    wc.fillRect(c*tw, r*th, tw, th);
  }
  // Building markers
  BUILDINGS.forEach(b=>{
    wc.fillStyle=b.color;
    wc.fillRect(b.tx*tw-4, b.ty*th-4, 8, 8);
    wc.fillStyle='#fff'; wc.font='9px sans-serif'; wc.textAlign='center';
    wc.fillText(b.icon, b.tx*tw, b.ty*th+14);
  });
  // Player marker
  wc.fillStyle='#4af7c4';
  wc.beginPath(); wc.arc(G.player.tx*tw+tw/2, G.player.ty*th+th/2, 4, 0, Math.PI*2); wc.fill();
  // Legend
  wc.fillStyle='rgba(10,12,20,0.85)'; wc.fillRect(0,H-28,W,28);
  wc.fillStyle='#4af7c4'; wc.font='8px "Press Start 2P"'; wc.textAlign='left';
  wc.fillText('● YOU   ■ BUILDINGS', 8, H-10);
}

// ── HUD Update ────────────────────────────────────────────
function updateHUD() {
  const lv=G.player.devLevel;
  hudLevel.innerHTML=`<span class="hud-label">DEV LV</span><span class="lv-val">${lv}</span><div id="xp-bar-wrap"><div id="xp-bar-fill"></div></div>`;
  document.getElementById('stat-coins').textContent=`🪙 ${G.player.coins||0}`;
  const activeQ=Object.values(G.quests).find(q=>q.status==='active');
  hudQuestBar.textContent=activeQ?`▶ ${activeQ.name}: ${activeQ.desc}`:(Object.values(G.quests).every(q=>q.status==='complete')?'🎉 ALL QUESTS COMPLETE! 🏆':'');
  const t=G.dayTime; const isDay=t<0.35||t>0.65;
  document.getElementById('time-label').textContent=isDay?'Day':'Night';
  document.querySelector('#hud-time .time-icon').textContent=isDay?'☀️':'🌙';
}

// ── Toasts ────────────────────────────────────────────────
let toastTimer=null, toast2Timer=null;
function showToast(msg) {
  toast.textContent=msg; toast.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),2800);
}
function showToast2(msg) {
  toast2.textContent=msg; toast2.classList.add('show');
  if(toast2Timer) clearTimeout(toast2Timer);
  toast2Timer=setTimeout(()=>toast2.classList.remove('show'),3200);
}

// ── Modals ────────────────────────────────────────────────
function openModal(el)  { el.classList.add('open'); }
function closeModal(el) { el.classList.remove('open'); }

// Section modal close buttons
document.querySelectorAll('.section-modal-close').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const id=btn.dataset.modal;
    document.getElementById(`modal-${id}`)?.classList.remove('open');
    playSelect();
  });
});

// Classic modal close buttons
document.querySelectorAll('.modal-close').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const t=btn.dataset.target;
    if(t==='quest') { closeModal(questModal); G.questOpen=false; }
    if(t==='inv')   { closeModal(invModal);   G.invOpen=false; }
    if(t==='pause') { closeModal(pauseModal); G.paused=false; }
    if(t==='map')   { closeModal(mapModal);   G.mapOpen=false; }
  });
});

// ── Save / Load ────────────────────────────────────────────
function saveGame() {
  const save={
    player:{ tx:G.player.tx, ty:G.player.ty, devLevel:G.player.devLevel, xp:G.player.xp, shirtColor:G.player.shirtColor, coins:G.player.coins },
    inventory:G.inventory, quests:G.quests,
    collectedItems:G.mapItems.map(i=>({id:i.id,collected:i.collected})),
    visitedBuildings:[...G.visitedBuildings],
  };
  localStorage.setItem('devvillage_xl_save', JSON.stringify(save));
  showToast('Game Saved! 💾');
}

function loadGame() {
  const raw=localStorage.getItem('devvillage_xl_save');
  if(!raw) { showToast('No save file found!'); return; }
  const save=JSON.parse(raw);
  Object.assign(G.player, save.player);
  G.player.px=G.player.tx*TILE; G.player.py=G.player.ty*TILE;
  G.inventory=save.inventory||[];
  G.quests=save.quests||G.quests;
  G.visitedBuildings=new Set(save.visitedBuildings||[]);
  save.collectedItems?.forEach(o=>{ const f=G.mapItems.find(i=>i.id===o.id); if(f) f.collected=o.collected; });
  updateHUD(); updateCamera(); updateHotbar();
  showToast('Game Loaded! ✅');
  closeModal(pauseModal); G.paused=false;
}

// ── Contact & Newsletter helpers ──────────────────────────
window.sendMessage = function() { showToast('Message sent! ✉️ (UI demo only)'); };
window.subscribeNewsletter = function() { showToast('Subscribed to Dev Dispatch! 📬'); };

// ── Drawing (unchanged) ───────────────────────────────────
function getTileColor(tile) {
  switch(tile) {
    case T.GRASS:      return '#2d6a30';
    case T.PATH:       return '#8a6840';
    case T.WATER:      return '#1a4068';
    case T.DEEP_WATER: return '#0e2844';
    case T.WALL:       return '#2a2a35';
    case T.DOOR:       return '#8b5e2a';
    case T.FLOWER:     return '#2d6a30';
    case T.TREE:       return '#1d4a1f';
    case T.SAND:       return '#c8a060';
    case T.STONE:      return '#505060';
    case T.SNOW:       return '#d8eef8';
    case T.COBBLE:     return '#4a4a60';
    case T.LAVA:       return '#9a2010';
    default:           return '#2d6a30';
  }
}

const animOffset = { time:0 };

function drawTile(tx2, ty2, tile) {
  const x=tx2*TILE-G.cam.x, y=ty2*TILE-G.cam.y;
  if(x>canvas.width+TILE||y>canvas.height+TILE||x<-TILE||y<-TILE) return;
  ctx.fillStyle=getTileColor(tile);
  ctx.fillRect(x,y,TILE,TILE);

  if(tile===T.GRASS) {
    ctx.fillStyle='#357538';
    ctx.fillRect(x+4,y+4,2,2); ctx.fillRect(x+20,y+14,2,2); ctx.fillRect(x+32,y+28,2,2);
  }
  if(tile===T.PATH) {
    ctx.fillStyle='#7a5830'; ctx.fillRect(x,y,TILE,1);
    ctx.fillStyle='#9a7850'; ctx.fillRect(x+5,y+5,2,TILE-10);
  }
  if(tile===T.COBBLE) {
    ctx.strokeStyle='#3a3a50'; ctx.lineWidth=0.7;
    for(let bx=0;bx<TILE;bx+=10) for(let by=0;by<TILE;by+=10) ctx.strokeRect(x+bx+0.5,y+by+0.5,9,9);
    ctx.fillStyle='#525268'; ctx.fillRect(x+2,y+2,3,3);
  }
  if(tile===T.WATER||tile===T.DEEP_WATER) {
    const wave=Math.sin(animOffset.time*0.002+tx2*0.5+ty2*0.3)*2;
    ctx.fillStyle=tile===T.DEEP_WATER?'#1a4898':'#1e5088';
    ctx.fillRect(x+3,y+8+wave,TILE-6,3);
    ctx.fillRect(x+6,y+22+wave,TILE-12,3);
  }
  if(tile===T.WALL) {
    ctx.fillStyle='#3a3a48';
    for(let bx=0;bx<TILE;bx+=8) for(let by=0;by<TILE;by+=8) {
      ctx.strokeStyle='#1a1a22'; ctx.lineWidth=0.5;
      ctx.strokeRect(x+bx+0.5,y+by+0.5,7,7);
    }
  }
  if(tile===T.DOOR) {
    ctx.fillStyle='#6b3e18'; ctx.fillRect(x+8,y+4,TILE-16,TILE-4);
    ctx.fillStyle='#f0d080'; ctx.beginPath(); ctx.arc(x+TILE/2+6,y+TILE/2,3,0,Math.PI*2); ctx.fill();
    // Glow on door
    ctx.fillStyle=`rgba(240,210,128,${0.15+Math.sin(animOffset.time*0.005)*0.1})`;
    ctx.fillRect(x+6,y+2,TILE-12,TILE-2);
  }
  if(tile===T.FLOWER) {
    [[10,10,'#f0a0c0'],[24,20,'#ff80a0'],[8,28,'#f0c0e0'],[28,8,'#f080c0']].forEach(([fx,fy,col])=>{
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x+fx,y+fy,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffe080'; ctx.beginPath(); ctx.arc(x+fx,y+fy,1.5,0,Math.PI*2); ctx.fill();
    });
  }
  if(tile===T.TREE) {
    ctx.fillStyle='#1d4a1f'; ctx.fillRect(x,y,TILE,TILE);
    const shade=Math.sin(animOffset.time*0.001+tx2*0.3)*0.05;
    ctx.fillStyle=`rgb(${45+shade*40|0},${112+shade*40|0},${48+shade*40|0})`;
    ctx.beginPath(); ctx.arc(x+TILE/2,y+TILE/2-4,TILE/2-4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5c3a1e'; ctx.fillRect(x+TILE/2-3,y+TILE-10,6,10);
  }
  if(tile===T.STONE) {
    ctx.fillStyle='#606070'; ctx.beginPath(); ctx.arc(x+TILE/2,y+TILE/2,TILE/2-4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#808090'; ctx.fillRect(x+12,y+14,8,4);
  }
  if(tile===T.SAND) {
    ctx.fillStyle='#d4ac6a'; ctx.fillRect(x+5,y+5,4,2); ctx.fillRect(x+22,y+18,4,2); ctx.fillRect(x+14,y+28,4,2);
  }
  if(tile===T.SNOW) {
    ctx.fillStyle='#e8f4ff'; ctx.fillRect(x+4,y+4,3,3); ctx.fillRect(x+20,y+16,3,3); ctx.fillRect(x+30,y+8,3,3);
  }
}

function drawBuildingLabels() {
  BUILDINGS.forEach(b=>{
    const x=b.tx*TILE-G.cam.x, y=b.ty*TILE-G.cam.y-28;
    if(x>canvas.width+100||y>canvas.height||x<-150||y<-40) return;
    const isNear = G.doorstepBuilding?.id===b.id;
    ctx.save();
    const glow=isNear?`rgba(${parseInt(b.color.slice(1,3),16)},${parseInt(b.color.slice(3,5),16)},${parseInt(b.color.slice(5,7),16)},0.4)`:'rgba(10,12,20,0.88)';
    ctx.fillStyle=isNear?glow:'rgba(10,12,20,0.88)';
    ctx.fillRect(x-60,y-18,148,24);
    ctx.strokeStyle=isNear?b.color:'#4af7c4';
    ctx.lineWidth=isNear?2:1;
    ctx.strokeRect(x-60,y-18,148,24);
    ctx.fillStyle=isNear?b.color:'#4af7c4';
    ctx.font='7px "Press Start 2P"'; ctx.textAlign='center';
    ctx.fillText(`${b.icon} ${b.label}`, x+14, y-2);
    ctx.restore();
  });
}

function drawPlayer() {
  const p=G.player;
  const x=p.px-G.cam.x, y=p.py-G.cam.y;
  const frame=Math.floor(p.animFrame)%2;
  const legOff=p.moving?(frame===0?3:-3):0;
  ctx.save();
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(x+TILE/2,y+TILE-4,10,4,0,0,Math.PI*2); ctx.fill();
  // Legs
  ctx.fillStyle='#2a3a60';
  ctx.fillRect(x+12,y+26,7,12+legOff); ctx.fillRect(x+21,y+26,7,12-legOff);
  // Shirt
  ctx.fillStyle=p.shirtColor; ctx.fillRect(x+10,y+16,20,14);
  // Backpack
  ctx.fillStyle='#8b6914'; ctx.fillRect(x+6,y+17,6,10);
  ctx.fillStyle='#a07820'; ctx.fillRect(x+7,y+19,4,2);
  // Head
  ctx.fillStyle='#f0c890'; ctx.fillRect(x+11,y+6,18,14);
  // Eyes
  ctx.fillStyle='#1a1a2e';
  if(p.dir!=='up') { ctx.fillRect(x+14,y+11,3,3); ctx.fillRect(x+23,y+11,3,3); }
  // Hat
  ctx.fillStyle='#2a2a3e'; ctx.fillRect(x+9,y+4,22,5); ctx.fillRect(x+12,y+0,16,6);
  ctx.restore();
}

function drawNPC(npc) {
  const x=npc.tx*TILE-G.cam.x, y=npc.ty*TILE-G.cam.y;
  if(x>canvas.width+40||y>canvas.height+40||x<-TILE*2||y<-TILE*2) return;
  const bounce=Math.sin(Date.now()*0.003+npc.tx)*2;
  ctx.save(); ctx.translate(0,bounce);
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(x+TILE/2,y+TILE-4,9,3,0,0,Math.PI*2); ctx.fill();
  // Legs
  ctx.fillStyle='#3a3a5a';
  ctx.fillRect(x+13,y+27,6,10); ctx.fillRect(x+21,y+27,6,10);
  // Body
  ctx.fillStyle=npc.color; ctx.fillRect(x+11,y+17,18,14);
  // Head
  ctx.fillStyle='#f5d5a0'; ctx.fillRect(x+12,y+7,16,14);
  // Eyes
  ctx.fillStyle='#1a1a2e'; ctx.fillRect(x+15,y+12,2,3); ctx.fillRect(x+22,y+12,2,3);
  // Hat
  ctx.fillStyle=npc.hatColor; ctx.fillRect(x+10,y+5,20,4); ctx.fillRect(x+13,y+1,14,6);
  // Name tag
  const tw2=npc.name.length*5.4+8;
  ctx.fillStyle='rgba(10,12,20,0.82)'; ctx.fillRect(x+TILE/2-tw2/2,y-16,tw2,13);
  ctx.strokeStyle=npc.color; ctx.lineWidth=1; ctx.strokeRect(x+TILE/2-tw2/2,y-16,tw2,13);
  ctx.fillStyle='#fff'; ctx.font='6px "Press Start 2P"'; ctx.textAlign='center';
  ctx.fillText(npc.name,x+TILE/2,y-6);
  ctx.restore();
}

function drawMapItem(item) {
  if(item.collected) return;
  const x=item.tx*TILE-G.cam.x+TILE/2, y=item.ty*TILE-G.cam.y+TILE/2;
  if(x>canvas.width+TILE||y>canvas.height+TILE||x<-TILE||y<-TILE) return;
  const bob=Math.sin(Date.now()*0.004+item.tx*0.5)*5;
  ctx.save(); ctx.translate(x,y+bob);
  // Glow
  const glow=ctx.createRadialGradient(0,0,2,0,0,22);
  glow.addColorStop(0,item.color+'bb'); glow.addColorStop(1,item.color+'00');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill();
  // Orb
  ctx.fillStyle=item.color; ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffffff60'; ctx.beginPath(); ctx.arc(-3,-3,4,0,Math.PI*2); ctx.fill();
  // Label
  ctx.fillStyle='#fff'; ctx.font='6px "Press Start 2P"'; ctx.textAlign='center';
  ctx.fillText(item.icon||item.label.split(' ')[0],0,26);
  ctx.restore();
}

function drawMinimap() {
  if(!mmCtx) return;
  const W=120, H=120;
  const tw=W/COLS, th=H/ROWS;
  mmCtx.fillStyle='#0a0a14'; mmCtx.fillRect(0,0,W,H);
  const tileColors2={
    [T.GRASS]:'#1a4020',[T.PATH]:'#6a4820',[T.WATER]:'#0a2848',[T.DEEP_WATER]:'#06182e',
    [T.WALL]:'#1a1a25',[T.DOOR]:'#6b4018',[T.TREE]:'#0d3010',[T.STONE]:'#303040',
    [T.FLOWER]:'#1a4020',[T.SAND]:'#8a6040',[T.SNOW]:'#c0d8e8',[T.COBBLE]:'#3a3a50',
  };
  for(let r=0;r<ROWS;r+=2) for(let c=0;c<COLS;c+=2) {
    mmCtx.fillStyle=tileColors2[MAP_TILES[r][c]]||'#1a4020';
    mmCtx.fillRect(c*tw,r*th,tw*2,th*2);
  }
  BUILDINGS.forEach(b=>{ mmCtx.fillStyle=b.color; mmCtx.fillRect(b.tx*tw-1,b.ty*th-1,3,3); });
  G.npcs.forEach(n=>{ mmCtx.fillStyle=n.color; mmCtx.fillRect(n.tx*tw,n.ty*th,2,2); });
  G.mapItems.forEach(i=>{ if(i.collected) return; mmCtx.fillStyle=i.color; mmCtx.fillRect(i.tx*tw,i.ty*th,2,2); });
  // Player
  mmCtx.fillStyle='#4af7c4';
  mmCtx.beginPath(); mmCtx.arc(G.player.tx*tw+tw/2,G.player.ty*th+th/2,2.5,0,Math.PI*2); mmCtx.fill();
  // Border
  mmCtx.strokeStyle='#4af7c4'; mmCtx.lineWidth=1; mmCtx.strokeRect(0,0,W,H);
}

function drawDayNightOverlay() {
  const t=G.dayTime;
  let darkness=0;
  if(t<0.3) darkness=0;
  else if(t<0.5) darkness=(t-0.3)/0.2;
  else if(t<0.7) darkness=1;
  else if(t<0.9) darkness=1-(t-0.7)/0.2;
  else darkness=0;
  const alpha=darkness*0.68;
  if(alpha<0.01) return;
  ctx.save();
  ctx.fillStyle=`rgba(5,10,35,${alpha})`; ctx.fillRect(0,0,canvas.width,canvas.height);
  // Lamp glows
  if(alpha>0.2) {
    const lamps=[[29*TILE,29*TILE],[30*TILE,30*TILE],[10*TILE,10*TILE],[50*TILE,10*TILE],[10*TILE,50*TILE],[50*TILE,50*TILE]];
    lamps.forEach(([lx,ly])=>{
      const cx2=lx-G.cam.x, cy2=ly-G.cam.y;
      const lg=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,100);
      lg.addColorStop(0,`rgba(255,220,100,${alpha*0.5})`); lg.addColorStop(1,'rgba(255,220,100,0)');
      ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(cx2,cy2,100,0,Math.PI*2); ctx.fill();
    });
  }
  ctx.restore();
}

// ── Main Loop ─────────────────────────────────────────────
function gameLoop(ts) {
  if(!G.started) { requestAnimationFrame(gameLoop); return; }
  const dt=Math.min(ts-G.lastTime,50);
  G.lastTime=ts;
  animOffset.time=ts;
  if(!G.paused&&!G.quizOpen) update(dt);
  draw();
  G.keyJustPressed={};
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  const p=G.player;
  if(!G.dlg.open&&!p.moving) {
    const moveMap=[
      ['ArrowUp','w','W',0,-1,'up'],['ArrowDown','s','S',0,1,'down'],
      ['ArrowLeft','a','A',-1,0,'left'],['ArrowRight','d','D',1,0,'right'],
    ];
    for(const [k1,k2,k3,dx,dy,dir] of moveMap) {
      if(G.keys[k1]||G.keys[k2]||G.keys[k3]) { p.dir=dir; tryMove(dx,dy); break; }
    }
  }
  if(p.moving) {
    p.moveTimer+=dt;
    const prog=Math.min(p.moveTimer/p.moveDuration,1);
    const ease=prog<0.5?2*prog*prog:-1+(4-2*prog)*prog;
    p.px=p.startPx+(p.targetPx-p.startPx)*ease;
    p.py=p.startPy+(p.targetPy-p.startPy)*ease;
    p.animTimer+=dt; if(p.animTimer>110){p.animTimer=0;p.animFrame++;}
    if(prog>=1) { p.moving=false; p.px=p.targetPx; p.py=p.targetPy; checkItemPickup(); }
  } else { p.animFrame=0; }
  updateCamera();
  if(G.dlg.open) tickDialogueType(dt);
  G.dayTimer+=dt/1000;
  G.dayTime=(G.dayTimer%G.DAY_CYCLE)/G.DAY_CYCLE;
  updateWeather(dt);
  updateParticles(dt);
  checkDoorstep();
  updateHUD();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#08090f'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // Draw map
  for(let ty2=0;ty2<ROWS;ty2++) for(let tx2=0;tx2<COLS;tx2++) drawTile(tx2,ty2,MAP_TILES[ty2][tx2]);
  drawBuildingLabels();
  G.mapItems.forEach(drawMapItem);
  G.npcs.forEach(drawNPC);
  drawPlayer();
  drawParticles();
  drawDayNightOverlay();
  drawWeather();
  drawMinimap();
}

// ── Start & Pause Buttons ─────────────────────────────────
startBtn.addEventListener('click',()=>{
  initAudio(); startBGMusic();
  G.started=true; G.lastTime=performance.now();
  startScreen.style.display='none';
  hud.style.display='block';
  minimapContainer.style.display='block';
  hotbar.style.display='flex';
  updateHUD();
  showToast('Welcome to Dev Village XL! 🗺️');
  setTimeout(()=>showToast2('💡 Walk to a doorstep and press [E] to enter!'),3500);
});

document.getElementById('btn-save').addEventListener('click',saveGame);
document.getElementById('btn-load').addEventListener('click',loadGame);
document.getElementById('btn-resume').addEventListener('click',()=>{ G.paused=false; closeModal(pauseModal); });
document.getElementById('btn-controls').addEventListener('click',()=>{ showToast('WASD=Move | E/SPC=Enter | I=Inv | Q=Quests | M=Map | ESC=Pause'); });

// ── Boot ──────────────────────────────────────────────────
initGame();
requestAnimationFrame(gameLoop);