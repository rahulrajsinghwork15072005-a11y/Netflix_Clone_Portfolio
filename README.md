# Rahul Raj Singh – Portfolio  
**A multi‑mode, interactive portfolio with cinematic intro, profile selection, and two distinct viewing experiences – built with vanilla HTML, CSS & JavaScript.**

---

## 🎯 Overview

|                      |                                                              |
|----------------------|--------------------------------------------------------------|
| **Type**             | Personal portfolio / interactive resume                      |
| **Modes**            | Recruiter (professional), Stalker (RPG game), Know Me (personal interests) |
| **Platform**         | Web browser (Chrome, Firefox, Edge, Safari)                  |
| **Technology**       | HTML5, CSS3, vanilla JavaScript – zero frameworks            |
| **Special Features** | Custom cursor, particle canvas, scroll‑triggered reveals, parallax, Web Audio, RPG world |
| **License**          | Personal portfolio – free to explore, not to misuse          |

---

## ✨ Features

### 🎬 Cinematic Intro
- Full‑screen intro with pulsing grid, animated title, and click‑to‑enter prompt.
- “Tadum” sound effect via Web Audio API on entry.

### 👤 Profile Selection
- Three profile cards: **Recruiter**, **Stalker**, **Know Me** (recommended).
- Each card has a unique SVG avatar and hover animation.
- Selecting a profile launches the corresponding site with a zoom‑out transition.

### 💼 Professional Site (Recruiter)
- Clean, modern layout with sticky navbar, smooth scrolling, and skill bars.
- Sections: Hero, About, Skills (with animated bars), Projects (10 real projects), Resume (timeline & download), Contact.
- All project cards are clickable, opening detailed modals with tech stack, highlights, and live/GitHub links.
- Parallax hero, scroll‑spy navigation highlighting, and “back to top” button.
- Download resume as a text file, or view directly.

### 🧑‍💻 Know Me Site (Personal Interests)
- Dark, editorial layout with tabs: Music, Films, Reading, Sports, Blogs.
- Tiles for favourite artists, songs, directors, movies, books, sports icons – each opens a detail modal.
- Blog section with filterable articles and rich‑text reading modal (includes code syntax highlighting).
- Rotating hobby text in the hero strip.

### 🎮 Stalker Site (RPG Portfolio)
- **Dev Village XL** – a 2D RPG world built entirely on Canvas.
- 60×60 tile map with 6 buildings (About, Projects, Skills, Contact, Experience, Education, Blog Tavern).
- 9 NPCs with dialogues, quests, and branching conversation choices.
- 5 collectable Tech Orbs, quiz challenges, inventory, minimap, day/night cycle, weather system.
- Doorstep interaction: walk near a building to get a prompt, press E/Space to enter a detailed modal.
- Each building opens a rich modal with real portfolio content (timeline, project cards, skill bars, contact terminal, etc.).
- Save/Load system using `localStorage`.

### 🎨 Shared Elements
- Custom cursor with magnetic hover effect.
- Particle canvas backdrop (shown during intro and after transitions).
- Scroll progress bar.
- Section reveal animations on scroll.
- Responsive design for all modes.

---

## 🚀 How to Run

1. **Clone or download** the repository.
2. Open `index.html` in any modern browser.
3. Click the intro screen (or press Enter) to start.
4. Choose a profile:
   - **Recruiter** → professional portfolio.
   - **Stalker** → RPG world (opens in an iframe).
   - **Know Me** → personal interests.

> No build tools, npm, or server required.  
> Font Awesome is loaded via CDN for some icons; an internet connection is needed on first load.

---

## 🧠 Technical Highlights

### Architecture
- Single‑page application with multiple “sites” toggled via CSS classes and JavaScript.
- All HTML, CSS, and JS are split into separate files for clarity:  
  `index.html` (main shell + pro‑site & know‑me markup), `script.js` (shared logic), `style.css` (global & mode‑specific styles).
- The RPG site is a self‑contained iframe with its own files (`rpg.html`, `rpg.js`, `rpg-style.css`).

### Animations & Effects
- Web Audio API for sound effects (tadum, click, door open, etc.).
- Canvas‑based particle system (60 floating particles) with smooth animation loop.
- CSS animations for intro zoom, card reveals, skill bar growth, and parallax.
- `IntersectionObserver` for scroll‑triggered reveal and navigation spy.

### RPG Engine (`rpg.js`)
- Tile‑based map with custom generation algorithm (grass, paths, water, buildings, forests).
- Collision detection and smooth player movement (easing).
- Dialogue system with typing effect and choice branching.
- Quest/progress tracking (5 quests), inventory, minimap.
- Day/night cycle with lighting overlay and lamp glows.
- Weather system (rain, storm, snow) with particle effects.
- Persistent save/load via `localStorage`.

### Professional Site
- Dynamic project card modals with full content (10 real projects).
- Animated skill bars using CSS custom properties.
- Timeline layout for education and experience.
- Contact section with a mini terminal and availability cards.

### Know Me Site
- Tabbed interface with interactive tiles that open detail modals.
- Blog viewer with reading progress bar, dark/light toggle inside modal, and social share buttons.
- Filterable blog cards.

### State Management
- All state is managed via simple JavaScript objects – no frameworks.
- Profile selection triggers smooth transitions between modes.
- RPG state is encapsulated in the `G` object within `rpg.js`.

---

> All assets (fonts, icons) are loaded from CDN; no local images or fonts required.

---

## 🎨 Customization

You can easily personalise the portfolio:

- **Content** – replace the text in `index.html` (pro‑site and know‑me sections) and `rpg.js` (NPC dialogues, project data) with your own information.
- **Colors & fonts** – modify the CSS custom properties in `:root` inside `style.css` and `rpg-style.css`.
- **Profile cards** – edit the SVG avatars and descriptions in the profile screen of `index.html`.
- **Projects** – update the `projectData` object in `script.js` and the project cards in `rpg.js` and `index.html`.
- **RPG map** – the map is generated programmatically in `rpg.js`; you can adjust tile types, building positions, and NPC locations.
- **Sound effects** – edit frequencies and durations in the `playBeep`, `playDoor`, etc. functions.

---

## 👤 Author

**Rahul Raj Singh**  
- GitHub: [https://github.com/rahulrajsinghwork15072005-a11y](https://github.com/rahulrajsinghwork15072005-a11y)  
- LinkedIn: [https://www.linkedin.com/in/rahul-raj-singh-57442a3b3/](https://www.linkedin.com/in/rahul-raj-singh-57442a3b3/)  
- Email: rahulrajsingh.work.15072005@gmail.com

---

## 🧾 License

This project is a personal portfolio and is provided for inspiration and educational purposes.  
Feel free to explore, learn, and adapt – but please do not represent it as your own work. No warranty.

**Choose your profile and dive in. 🔴🟡🟢**  

## 📁 File Structure
