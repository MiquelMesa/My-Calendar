
 **My Calendar**
 
 v1.1.0 - new functionalities 

A beautiful, multilingual calendar/almanac with sun & moon data, saints, seasonal food, sayings, and multiple views. Built with HTML/CSS/JS and packaged for Windows via Electron.

## ✨ Features
- 🗓️ Views: **Month**, **Week**, **Year (12 + 3 months)**
- 📅 Week starts on **Monday**; **Week numbers** shown
- 🌙 Moon: phase image, name, description, **moonrise/moonset** times
- ☀️ Sun: sunrise/sunset (Barcelona by default)
- 🌍 Live clocks: local + **60 world cities** (dropdown)
- ⛪ Saints: Catalan / Spanish / English traditions (365 days)
- 💬 Catalan sayings (with ES/EN translations)
- 🍎 Seasonal fruits & vegetables (by month, multilingual)
- 🌸 Seasons with icons (Spring/Summer/Autumn/Winter)
- 🎨 Themes: Light, Dark, System
- 🌐 Languages: Català (default), Español, English
- 🖱️ Click any date to view its info; Today button jumps back to today

## 📂 Project Structure
```
MyCalendar/
├── HTML/index.html          # Main page
├── CSS/styles.css           # Styles
├── JS/app.js                # App logic (loads JSON data)
├── DATA/                    # JSON data
│   ├── saints_ca.json
│   ├── saints_es.json
│   ├── saints_en.json
│   ├── sayings.json
│   ├── seasonal_food.json
│   ├── translations.json
│   └── cities.json
├── IMG/                     # 14 required images (see below)
├── package.json             # Electron config
├── main.js                  # Electron main process
├── preload.js               # Electron preload (security)
├── build/icon.ico           # App icon (multi-size ICO)
└── GUIDE_FOR_BEGINNERS.md   # Step-by-step guide
```

## 🖼️ Required Images (place in `IMG/`)
- `sunrise.png`, `sunset.png`
- Moon phases: `new-moon.png`, `waxing-crescent.png`, `first-quarter.png`, `waxing-gibbous.png`, `full-moon.png`, `waning-gibbous.png`, `last-quarter.png`, `waning-crescent.png`
- Seasons: `spring.png`, `summer.png`, `autumn.png`, `winter.png`
- Optional: `moon-rise.png`, `moon-set.png` (for moonrise/moonset icons)

## 🚀 How to Run (Web - Live Server)
1) Install **VS Code** and the **Live Server** extension (Ritwick Dey).
2) Open the project folder in VS Code.
3) Right-click `HTML/index.html` → **Open with Live Server**.
4) Browser opens (e.g., http://127.0.0.1:5500/HTML/index.html).

> Because the app loads JSON files, it must be served via a local server (Live Server handles this automatically).

## 💻 How to Run (Electron - Development)
Prerequisite: **Node.js LTS** installed.

```
cd MyCalendar
npm install
npm start
```
Electron window should open with the app.

## 🏗️ How to Build Windows Installer
```
npm run build
```
When finished, check `dist/`:
- `My Calendar Setup 1.0.0.exe` (installer)
- `win-unpacked/` (portable)

> If you get a privilege/symlink error, rerun Command Prompt **as Administrator** and rebuild. Make sure `build/icon.ico` is a real multi-size ICO (256,128,64,48,32,16) ~50KB+.

## 🛠️ Troubleshooting
- **Blank app / JSON errors**: Open DevTools (F12) → Console. Ensure all JSON files exist and are valid (no trailing commas).
- **Images not showing**: Verify file names in `IMG/` match exactly (case-sensitive).
- **Today button**: Resets to today and Month view.
- **Same day number highlight**: Dates matching today’s day number show a secondary dashed highlight in all views.

## 📜 License
MIT License (see `LICENSE`).

## 🙌 Credits & Notes
- Data files are easily editable in `DATA/` (saints, sayings, food, translations, cities).
- Default location: Barcelona (sun/moon times). You can change it in `JS/app.js` (LOCATION).

Enjoy your calendar!

Made with love by Mchael MR in Barcelona
