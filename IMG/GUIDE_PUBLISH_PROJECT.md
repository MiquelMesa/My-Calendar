# My Calendar - Publishing Guide

This guide explains how to:
1. Convert the project to a **Windows Desktop Application** using Electron
2. Publish the project on **GitHub** as open source

---

# PART 1: CONVERT TO WINDOWS DESKTOP APP (ELECTRON)

## What is Electron?

Electron is a framework that allows you to build desktop applications using HTML, CSS, and JavaScript. Apps like **VS Code**, **Slack**, **Discord**, and **WhatsApp Desktop** are built with Electron.

✅ **Yes, Electron is the best option** for your project!

---

## Prerequisites

Before starting, you need to install:

### Step 1: Install Node.js

1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer and follow the prompts
4. Verify installation - Open **Command Prompt** (Win + R → type `cmd`) and run:
   ```
   node --version
   npm --version
   ```
   You should see version numbers (e.g., `v20.x.x` and `10.x.x`)

---

## Convert Your Project to Electron

### Step 2: Reorganize Your Project Structure

Your current structure needs a small adjustment. Create this structure:

```
MyCalendar/
├── package.json          ← NEW (Electron config)
├── main.js               ← NEW (Electron main process)
├── preload.js            ← NEW (Security bridge)
├── src/                  ← RENAME: Move your files here
│   ├── HTML/
│   │   └── index.html
│   ├── CSS/
│   │   └── styles.css
│   ├── JS/
│   │   └── app.js
│   └── IMG/
│       └── (your images)
└── build/                ← NEW (for app icons)
    └── icon.ico
```

### Step 3: Create package.json

In the `MyCalendar` folder, create a file named `package.json`:

```json
{
  "name": "my-calendar",
  "version": "1.0.0",
  "description": "A beautiful calendar app with moon phases, saints, and seasonal information",
  "main": "main.js",
  "author": "Your Name",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  },
  "build": {
    "appId": "com.yourname.mycalendar",
    "productName": "My Calendar",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Step 4: Create main.js

In the `MyCalendar` folder, create a file named `main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'build', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load your HTML file
    mainWindow.loadFile(path.join(__dirname, 'src', 'HTML', 'index.html'));

    // Remove menu bar (optional)
    mainWindow.setMenuBarVisibility(false);
}

// When Electron is ready, create the window
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed (Windows & Linux)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
```

### Step 5: Create preload.js

In the `MyCalendar` folder, create a file named `preload.js`:

```javascript
// This file runs before your web page loads
// It's used for security - keeping Node.js separate from the browser

window.addEventListener('DOMContentLoaded', () => {
    console.log('My Calendar loaded successfully!');
});
```

### Step 6: Update HTML File Paths

Since files are now in `src/`, update `index.html` paths:

Change:
```html
<link rel="stylesheet" href="../CSS/styles.css">
<script src="../JS/app.js"></script>
```

To:
```html
<link rel="stylesheet" href="../CSS/styles.css">
<script src="../JS/app.js"></script>
```

*(Paths stay the same because the relative structure is maintained)*

### Step 7: Create App Icon

You need a `.ico` file for Windows:

1. Create or find a calendar icon (256x256 pixels minimum)
2. Convert to `.ico` format using: https://convertico.com/
3. Save as `build/icon.ico`

### Step 8: Install Dependencies

Open **Command Prompt** in your `MyCalendar` folder:

```bash
cd C:\path\to\MyCalendar
npm install
```

This will create a `node_modules` folder with all dependencies.

### Step 9: Test Your App

Run the app in development mode:

```bash
npm start
```

Your calendar should open as a desktop window! 🎉

### Step 10: Build the Installer

Create a Windows installer (.exe):

```bash
npm run build
```

This creates a `dist/` folder containing:
- `My Calendar Setup 1.0.0.exe` ← Installer for users
- `win-unpacked/` ← Portable version

---

## Summary of New Files Needed:

| File | Purpose |
|------|---------|
| `package.json` | Project configuration & dependencies |
| `main.js` | Electron main process (creates window) |
| `preload.js` | Security bridge |
| `build/icon.ico` | Windows app icon |

---

# PART 2: PUBLISH ON GITHUB

## What is GitHub?

GitHub is a platform for hosting and sharing code. Making your project public allows others to use, learn from, and contribute to your work.

---

## Prerequisites

### Step 1: Create a GitHub Account

1. Go to: https://github.com/
2. Click **"Sign up"**
3. Follow the registration process
4. Verify your email address

### Step 2: Install Git on Windows

1. Go to: https://git-scm.com/download/win
2. Download the installer (64-bit)
3. Run the installer with default options
4. Verify installation - Open **Command Prompt** and run:
   ```
   git --version
   ```
   You should see something like `git version 2.43.0`

### Step 3: Configure Git

Open **Command Prompt** and run these commands (use your info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Prepare Your Project for GitHub

### Step 4: Create .gitignore File

In your `MyCalendar` folder, create a file named `.gitignore` (no extension):

```
# Dependencies
node_modules/

# Build output
dist/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
```

### Step 5: Create README.md

Create a `README.md` file in your project root:

```markdown
# My Calendar 📅

A beautiful, feature-rich calendar application built with HTML, CSS, and JavaScript.

![My Calendar Screenshot](screenshot.png)

## Features

- 📆 **Three Views**: Month, Week, and Year (12 + 3 months)
- 🌍 **Multilingual**: Català, Español, English
- 🌓 **Themes**: Dark, Light, and System
- 🕐 **World Clock**: Local time + 16 major world cities
- ☀️ **Sun Times**: Sunrise and sunset for selected date
- 🌙 **Moon Phases**: 8 phases with images and descriptions
- 🌸 **Seasons**: Automatic season detection with images
- ⛪ **Saints (Santoral)**: 365 days of Catalan Catholic saints
- 🍎 **Seasonal Food**: Monthly fruits and vegetables (Catalonia)
- 🖱️ **Interactive**: Click any day to see its information

## Installation

### Web Version
1. Clone this repository
2. Open `HTML/index.html` in your browser

### Desktop Version (Electron)
1. Install [Node.js](https://nodejs.org/)
2. Run `npm install`
3. Run `npm start`

### Build Windows Installer
```bash
npm run build
```

## Project Structure

```
MyCalendar/
├── HTML/index.html     # Main HTML file
├── CSS/styles.css      # Styles with theme support
├── JS/app.js           # Application logic
├── IMG/                # Images (moon, sun, seasons)
├── main.js             # Electron main process
├── package.json        # Project configuration
└── README.md           # This file
```

## Images Required

Download these images and place them in the `IMG/` folder:

| File | Description |
|------|-------------|
| sunrise.png | Sunrise icon |
| sunset.png | Sunset icon |
| new-moon.png | New Moon |
| waxing-crescent.png | Waxing Crescent |
| first-quarter.png | First Quarter |
| waxing-gibbous.png | Waxing Gibbous |
| full-moon.png | Full Moon |
| waning-gibbous.png | Waning Gibbous |
| last-quarter.png | Last Quarter |
| waning-crescent.png | Waning Crescent |
| spring.png | Spring season |
| summer.png | Summer season |
| autumn.png | Autumn season |
| winter.png | Winter season |

Free sources: [Flaticon](https://www.flaticon.com/), [Icons8](https://icons8.com/), [SVG Repo](https://www.svgrepo.com/)

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

**Your Name**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
```

### Step 6: Create LICENSE File

Create a `LICENSE` file (MIT License is popular for open source):

```
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Create GitHub Repository

### Step 7: Create New Repository on GitHub

1. Go to: https://github.com/
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `my-calendar`
   - **Description**: "A beautiful calendar app with moon phases, saints, and seasonal information"
   - **Public** ← Select this to make it public
   - ✅ Check "Add a README file" → **NO** (we created our own)
   - Click **"Create repository"**

### Step 8: Upload Your Project

After creating the repository, GitHub shows instructions. Open **Command Prompt** in your `MyCalendar` folder:

```bash
# Navigate to your project
cd C:\path\to\MyCalendar

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: My Calendar v1.0.0"

# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/my-calendar.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 9: Verify Upload

1. Go to your repository: `https://github.com/YOUR_USERNAME/my-calendar`
2. You should see all your files!
3. The README.md will display automatically

---

## Optional: Add a Screenshot

1. Take a screenshot of your calendar app
2. Save it as `screenshot.png` in your project folder
3. Update and push:
   ```bash
   git add screenshot.png
   git commit -m "Add screenshot"
   git push
   ```

---

## Optional: Create Releases

To share downloadable versions:

1. Go to your repository on GitHub
2. Click **"Releases"** (right sidebar)
3. Click **"Create a new release"**
4. Fill in:
   - **Tag version**: `v1.0.0`
   - **Release title**: `My Calendar v1.0.0`
   - **Description**: List features
   - **Attach files**: Upload your `My Calendar Setup 1.0.0.exe`
5. Click **"Publish release"**

Now users can download the installer directly!

---

## Summary: Files for GitHub

Your final project structure:

```
MyCalendar/
├── .gitignore            ← Ignore node_modules, dist
├── LICENSE               ← MIT License
├── README.md             ← Project description
├── package.json          ← Electron config
├── main.js               ← Electron main process
├── preload.js            ← Security bridge
├── screenshot.png        ← App screenshot (optional)
├── build/
│   └── icon.ico          ← App icon
├── HTML/
│   └── index.html
├── CSS/
│   └── styles.css
├── JS/
│   └── app.js
└── IMG/
    └── (14 images)
```

---

# 🎉 Congratulations!

You now have:
1. ✅ A **Windows desktop application** with installer
2. ✅ A **public GitHub repository** for sharing

Your calendar is ready for the world! 🌍📅

---

## Useful Links

| Resource | URL |
|----------|-----|
| Node.js | https://nodejs.org/ |
| Electron | https://www.electronjs.org/ |
| Electron Builder | https://www.electron.build/ |
| Git | https://git-scm.com/ |
| GitHub | https://github.com/ |
| GitHub Docs | https://docs.github.com/ |
| Icon Converter | https://convertico.com/ |
| Flaticon | https://www.flaticon.com/ |

---

## Need Help?

If you encounter any issues:
1. **Electron issues**: Check https://www.electronjs.org/docs
2. **Git issues**: Check https://docs.github.com/en/get-started
3. **Or ask me!** I'm happy to help troubleshoot.