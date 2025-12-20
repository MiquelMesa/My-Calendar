/* ========================================
   MY CALENDAR - JAVASCRIPT APPLICATION
   ======================================== */

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const LOCATION = {
    name: 'Barcelona, Catalunya',
    lat: 41.3851,
    lng: 2.1734,
    timezone: 'Europe/Madrid'
};

const MOON_IMAGES = {
    0: 'new-moon.png',
    1: 'waxing-crescent.png',
    2: 'first-quarter.png',
    3: 'waxing-gibbous.png',
    4: 'full-moon.png',
    5: 'waning-gibbous.png',
    6: 'last-quarter.png',
    7: 'waning-crescent.png'
};

// ==========================================
// APPLICATION STATE
// ==========================================

let state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    viewDate: new Date(),
    currentView: 'month',
    language: 'ca',
    theme: 'dark',
    selectedWorldCity: 'America/New_York',
    saintsData: null,
    sayingsData: null,
    seasonalFoodData: null,
    translationsData: null,
    citiesData: null
};

// ==========================================
// DATA LOADING
// ==========================================

async function loadJSON(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error(`❌ Invalid JSON in ${path}`);
        console.error('First 200 chars:', text.slice(0, 200));
        throw err;
    }
}

async function loadJSONData() {
    const [saints_ca, saints_es, saints_en, sayings, food, translations, cities] = await Promise.all([
        loadJSON('../DATA/saints_ca.json'),
        loadJSON('../DATA/saints_es.json'),
        loadJSON('../DATA/saints_en.json'),
        loadJSON('../DATA/sayings.json'),
        loadJSON('../DATA/seasonal_food.json'),
        loadJSON('../DATA/translations.json'),
        loadJSON('../DATA/cities.json')
    ]);

    state.saintsData = { ca: saints_ca, es: saints_es, en: saints_en };
    state.sayingsData = sayings;
    state.seasonalFoodData = food;
    state.translationsData = translations;
    state.citiesData = cities;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function t(key) {
    return state.translationsData[state.language][key] || key;
}

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function getDaysInYear(year) {
    return ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 366 : 365;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getFirstDayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function isSameDay(a, b) {
    return a.getDate() === b.getDate() &&
           a.getMonth() === b.getMonth() &&
           a.getFullYear() === b.getFullYear();
}

function isSameDayNumber(a, b) {
    return a.getDate() === b.getDate();
}

function getDayName(dayIndex) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(days[dayIndex]);
}

// ==========================================
// TIME FUNCTIONS
// ==========================================

function updateClocks() {
    const now = new Date();

    const localTime = now.toLocaleTimeString('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    document.getElementById('localTime').textContent = localTime;

    const worldTime = now.toLocaleTimeString('es-ES', {
        timeZone: state.selectedWorldCity,
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    document.getElementById('worldTime').textContent = worldTime;

    const sel = document.getElementById('worldCitySelect');
    if (sel && sel.selectedOptions[0]) {
        document.getElementById('worldCityName').textContent = sel.selectedOptions[0].text;
    }
}

// ==========================================
// SUN CALCULATIONS
// ==========================================

function calculateSunTimes(date, lat, lng) {
    const dayOfYear = getDayOfYear(date);
    const zenith = 90.833;
    const latRad = lat * Math.PI / 180;
    const declination = 23.45 * Math.sin((360 / 365 * (dayOfYear - 81)) * Math.PI / 180);
    const decRad = declination * Math.PI / 180;
    const cosHourAngle = (Math.cos(zenith * Math.PI / 180) / (Math.cos(latRad) * Math.cos(decRad))) - Math.tan(latRad) * Math.tan(decRad);
    const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
    const hourAngle = Math.acos(clampedCos) * 180 / Math.PI;
    const solarNoon = 12 - lng / 15;
    const sunriseHour = solarNoon - hourAngle / 15;
    const sunsetHour = solarNoon + hourAngle / 15;
    const offset = -new Date().getTimezoneOffset() / 60;
    return {
        sunrise: formatDecimalTime(sunriseHour + offset),
        sunset: formatDecimalTime(sunsetHour + offset)
    };
}

function formatDecimalTime(decimalHours) {
    let hours = Math.floor(decimalHours);
    let minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) { hours++; minutes = 0; }
    if (hours >= 24) hours -= 24;
    if (hours < 0) hours += 24;
    return `${formatNumber(hours)}:${formatNumber(minutes)}`;
}

// ==========================================
// MOON CALCULATIONS (approximate)
// ==========================================

function getMoonPhase(date) {
    // Known New Moon: December 30, 2024 at 22:27 UTC
    const knownNewMoon = new Date('2024-12-30T22:27:00Z');
    const lunarCycle = 29.53058867; // days
    const diffTime = date - knownNewMoon;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    let dayInCycle = diffDays % lunarCycle;
    if (dayInCycle < 0) dayInCycle += lunarCycle;
    const phaseNumber = (dayInCycle / lunarCycle) * 8;
    let phaseIndex = Math.round(phaseNumber) % 8;
    return phaseIndex;
}

function calculateMoonTimes(date, lat, lng) {
    const phase = getMoonPhase(date);
    const phaseHours = (phase / 8) * 24;
    let moonriseHour = 6 + phaseHours;
    let moonsetHour = 18 + phaseHours;
    const dayOfMonth = date.getDate();
    const dailyVariation = (dayOfMonth % 29) * 0.85;
    moonriseHour += dailyVariation;
    moonsetHour += dailyVariation;
    while (moonriseHour >= 24) moonriseHour -= 24;
    while (moonriseHour < 0) moonriseHour += 24;
    while (moonsetHour >= 24) moonsetHour -= 24;
    while (moonsetHour < 0) moonsetHour += 24;
    return {
        rise: formatDecimalTime(moonriseHour),
        set: formatDecimalTime(moonsetHour)
    };
}

// ==========================================
// SEASON CALCULATIONS
// ==========================================

function getCurrentSeason(date) {
    const m = date.getMonth();
    const d = date.getDate();
    if ((m === 2 && d >= 20) || m === 3 || m === 4 || (m === 5 && d <= 20)) return 'spring';
    if ((m === 5 && d >= 21) || m === 6 || m === 7 || (m === 8 && d <= 22)) return 'summer';
    if ((m === 8 && d >= 23) || m === 9 || m === 10 || (m === 11 && d <= 20)) return 'autumn';
    return 'winter';
}

function updateSeasonDisplay() {
    const season = getCurrentSeason(state.selectedDate);
    document.getElementById('seasonImage').src = `../IMG/${season}.png`;
    document.getElementById('seasonName').textContent = t(season);
}

// ==========================================
// SAINTS FUNCTIONS
// ==========================================

function getSaintsOfDay(date) {
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    const saintData = state.saintsData[state.language][key];
    return saintData || '--';
}

function updateSaintsDisplay() {
    document.getElementById('saintsNames').textContent = getSaintsOfDay(state.selectedDate);
}

// ==========================================
// SAYINGS FUNCTIONS (by month)
// ==========================================

function getSayingOfMonth(date) {
    const month = String(date.getMonth() + 1);
    const s = state.sayingsData[month];
    if (!s) return '--';
    return s[state.language] || s['ca'] || '--';
}

function updateSayingDisplay() {
    document.getElementById('sayingText').textContent = getSayingOfMonth(state.selectedDate);
}

// ==========================================
// SEASONAL FOOD FUNCTIONS
// ==========================================

function getSeasonalFood(date) {
    const month = String(date.getMonth() + 1);
    const food = state.seasonalFoodData[month];
    if (!food) return { fruits: '--', vegetables: '--' };
    return {
        fruits: food.fruits[state.language] || food.fruits.ca || '--',
        vegetables: food.vegetables[state.language] || food.vegetables.ca || '--'
    };
}

function updateSeasonalFoodDisplay() {
    const food = getSeasonalFood(state.selectedDate);
    document.getElementById('seasonalFruits').textContent = food.fruits;
    document.getElementById('seasonalVegetables').textContent = food.vegetables;
}

// ==========================================
// THEME MANAGEMENT
// ==========================================

function setTheme(theme) {
    state.theme = theme;
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('calendarTheme', theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('calendarTheme') || 'dark';
    document.getElementById('themeSelect').value = savedTheme;
    setTheme(savedTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (state.theme === 'system') {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// ==========================================
// LANGUAGE MANAGEMENT
// ==========================================

function setLanguage(lang) {
    state.language = lang;
    localStorage.setItem('calendarLanguage', lang);
    updateAllTranslations();
    renderCurrentView();
    updateInfoPanel();
}

function updateAllTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = state.translationsData[state.language][key];
        if (val) el.textContent = val;
    });
}

function initLanguage() {
    const savedLang = localStorage.getItem('calendarLanguage') || 'ca';
    document.getElementById('languageSelect').value = savedLang;
    state.language = savedLang;
    updateAllTranslations();
}

// ==========================================
// INFO PANEL
// ==========================================

function updateInfoPanel() {
    const d = state.selectedDate;
    document.getElementById('dayName').textContent = getDayName(d.getDay());
    document.getElementById('dayNumber').textContent = d.getDate();
    const monthName = state.translationsData[state.language].months[d.getMonth()];
    document.getElementById('monthYearDisplay').textContent = `${monthName} ${d.getFullYear()}`;
    const dayOfYear = getDayOfYear(d);
    const daysInYear = getDaysInYear(d.getFullYear());
    document.getElementById('dayOfYear').textContent = t('dayOf').replace('{0}', dayOfYear).replace('{1}', daysInYear);

    const weekNumber = getWeekNumber(d);
    document.getElementById('weekNumberValue').textContent = formatNumber(weekNumber);
    document.getElementById('weekNumberLabel').textContent = t('weekLabel');

    const sunTimes = calculateSunTimes(d, LOCATION.lat, LOCATION.lng);
    document.getElementById('sunriseTime').textContent = sunTimes.sunrise;
    document.getElementById('sunsetTime').textContent = sunTimes.sunset;

    const phase = getMoonPhase(d);
    const moonData = state.translationsData[state.language].moonPhases[String(phase)];
    document.getElementById('moonImage').src = `../IMG/${MOON_IMAGES[phase]}`;
    document.getElementById('moonPhaseName').textContent = moonData ? moonData.name : '--';
    document.getElementById('moonPhaseDesc').textContent = moonData ? moonData.desc : '--';

    const moonTimes = calculateMoonTimes(d, LOCATION.lat, LOCATION.lng);
    document.getElementById('moonriseTime').textContent = moonTimes.rise;
    document.getElementById('moonsetTime').textContent = moonTimes.set;

    updateSeasonDisplay();
    updateSaintsDisplay();
    updateSayingDisplay();
    updateSeasonalFoodDisplay();
    updateClocks();
}

// ==========================================
// CALENDAR RENDERING
// ==========================================

function renderMonthView() {
    const container = document.getElementById('monthDays');
    container.innerHTML = '';
    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    const monthName = state.translationsData[state.language].months[month];
    document.getElementById('currentPeriod').textContent = `${monthName} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDate = getFirstDayOfWeek(firstDay);
    const endDate = new Date(lastDay);
    while (endDate.getDay() !== 0) endDate.setDate(endDate.getDate() + 1);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const weekNum = document.createElement('div');
        weekNum.className = 'week-number';
        weekNum.textContent = getWeekNumber(currentDate);
        container.appendChild(weekNum);

        for (let i = 0; i < 7; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            const dayNum = document.createElement('span');
            dayNum.className = 'day-num';
            dayNum.textContent = currentDate.getDate();
            const cellDate = new Date(currentDate);

            if (currentDate.getMonth() !== month) dayCell.classList.add('other-month');
            if (isSameDay(currentDate, state.currentDate)) dayCell.classList.add('today');
            else if (isSameDayNumber(currentDate, state.currentDate)) dayCell.classList.add('today-number-match');
            if (isSameDay(currentDate, state.selectedDate)) dayCell.classList.add('selected');
            if (i >= 5) dayCell.classList.add('weekend');

            dayCell.addEventListener('click', () => selectDate(cellDate));
            dayCell.appendChild(dayNum);
            container.appendChild(dayCell);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
}

function renderWeekView() {
    const container = document.getElementById('weekDays');
    container.innerHTML = '';

    const startOfWeek = getFirstDayOfWeek(state.viewDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const startMonth = state.translationsData[state.language].monthsShort[startOfWeek.getMonth()];
    const endMonth = state.translationsData[state.language].monthsShort[endOfWeek.getMonth()];
    const periodText = startOfWeek.getMonth() === endOfWeek.getMonth()
        ? `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startMonth} ${startOfWeek.getFullYear()}`
        : `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${endOfWeek.getFullYear()}`;
    document.getElementById('currentPeriod').textContent = periodText;

    const weekNum = document.createElement('div');
    weekNum.className = 'week-number';
    weekNum.textContent = getWeekNumber(startOfWeek);
    container.appendChild(weekNum);

    let currentDate = new Date(startOfWeek);
    for (let i = 0; i < 7; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell week-view-cell';
        const cellDate = new Date(currentDate);

        const dayName = document.createElement('span');
        dayName.className = 'week-day-name';
        dayName.textContent = getDayName(currentDate.getDay());
        const dayNum = document.createElement('span');
        dayNum.className = 'day-num';
        dayNum.textContent = currentDate.getDate();

        if (isSameDay(currentDate, state.currentDate)) dayCell.classList.add('today');
        else if (isSameDayNumber(currentDate, state.currentDate)) dayCell.classList.add('today-number-match');
        if (isSameDay(currentDate, state.selectedDate)) dayCell.classList.add('selected');
        if (i >= 5) dayCell.classList.add('weekend');

        dayCell.addEventListener('click', () => selectDate(cellDate));
        dayCell.appendChild(dayName);
        dayCell.appendChild(dayNum);
        container.appendChild(dayCell);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function renderYearView() {
    const container = document.getElementById('yearGrid');
    container.innerHTML = '';
    const currentYear = state.viewDate.getFullYear();
    document.getElementById('currentPeriod').textContent = `${currentYear} - ${currentYear + 1}`;

    for (let i = 0; i < 15; i++) {
        const year = i < 12 ? currentYear : currentYear + 1;
        const month = i < 12 ? i : i - 12;
        const miniMonth = document.createElement('div');
        miniMonth.className = 'mini-month' + (i >= 12 ? ' next-year' : '');

        const header = document.createElement('div');
        header.className = 'mini-month-header';
        header.textContent = `${state.translationsData[state.language].months[month]} ${year}`;
        miniMonth.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'mini-month-grid';
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'mini-week-num';
        grid.appendChild(emptyHeader);
        const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        dayKeys.forEach((day, idx) => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'mini-day-header' + (idx >= 5 ? ' weekend' : '');
            const txt = t(day);
            dayHeader.textContent = txt.length >= 2 ? txt.slice(0, 2) : txt;
            grid.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDate = getFirstDayOfWeek(firstDay);
        const endDate = new Date(lastDay);
        while (endDate.getDay() !== 0) endDate.setDate(endDate.getDate() + 1);
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const weekNumCell = document.createElement('div');
            weekNumCell.className = 'mini-week-num';
            weekNumCell.textContent = getWeekNumber(currentDate);
            grid.appendChild(weekNumCell);
            for (let j = 0; j < 7; j++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'mini-day';
                dayCell.textContent = currentDate.getDate();
                const cellDate = new Date(currentDate);
                if (currentDate.getMonth() !== month) dayCell.classList.add('other-month');
                if (isSameDay(currentDate, state.currentDate)) dayCell.classList.add('today');
                else if (isSameDayNumber(currentDate, state.currentDate)) dayCell.classList.add('today-number-match');
                if (isSameDay(currentDate, state.selectedDate)) dayCell.classList.add('selected');
                if (j >= 5) dayCell.classList.add('weekend');
                dayCell.addEventListener('click', () => selectDate(cellDate));
                grid.appendChild(dayCell);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        miniMonth.appendChild(grid);
        container.appendChild(miniMonth);
    }
}

function renderCurrentView() {
    switch (state.currentView) {
        case 'month':
            renderMonthView();
            break;
        case 'week':
            renderWeekView();
            break;
        case 'year':
            renderYearView();
            break;
    }
    // Always refresh info when view changes
    updateInfoPanel();
}

// ==========================================
// VIEW SWITCHING & NAVIGATION
// ==========================================

function switchView(view) {
    state.currentView = view;
    state.viewDate = new Date(state.selectedDate);
    document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
    document.getElementById(`${view}ViewBtn`).classList.add('active');
    document.querySelectorAll('.calendar-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
    renderCurrentView();
}

function navigate(direction) {
    switch (state.currentView) {
        case 'month': state.viewDate.setMonth(state.viewDate.getMonth() + direction); break;
        case 'week': state.viewDate.setDate(state.viewDate.getDate() + (direction * 7)); break;
        case 'year': state.viewDate.setFullYear(state.viewDate.getFullYear() + direction); break;
    }
    renderCurrentView();
}

function goToToday() {
    state.currentDate = new Date();
    state.selectedDate = new Date(state.currentDate);
    state.viewDate = new Date(state.currentDate);
    switchView('month');
    updateInfoPanel();
}

function selectDate(date) {
    state.selectedDate = new Date(date);
    state.viewDate = new Date(date);
    renderCurrentView();
    updateInfoPanel();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    document.getElementById('prevBtn').addEventListener('click', () => navigate(-1));
    document.getElementById('nextBtn').addEventListener('click', () => navigate(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);
    document.getElementById('monthViewBtn').addEventListener('click', () => switchView('month'));
    document.getElementById('weekViewBtn').addEventListener('click', () => switchView('week'));
    document.getElementById('yearViewBtn').addEventListener('click', () => switchView('year'));
    document.getElementById('languageSelect').addEventListener('change', e => setLanguage(e.target.value));
    document.getElementById('themeSelect').addEventListener('change', e => setTheme(e.target.value));
    document.getElementById('worldCitySelect').addEventListener('change', e => {
        state.selectedWorldCity = e.target.value;
        localStorage.setItem('calendarWorldCity', e.target.value);
        updateClocks();
    });
}

function initWorldCity() {
    const savedCity = localStorage.getItem('calendarWorldCity') || 'America/New_York';
    state.selectedWorldCity = savedCity;
    const sel = document.getElementById('worldCitySelect');
    if (sel) sel.value = savedCity;
}

// ==========================================
// INITIALIZATION
// ==========================================

async function init() {
    try {
        await loadJSONData();
    } catch (err) {
        console.error('Data loading failed:', err);
        return;
    }
    state.currentDate = new Date();
    state.selectedDate = new Date();
    state.viewDate = new Date();
    initTheme();
    initLanguage();
    initWorldCity();
    initEventListeners();
    updateInfoPanel();
    renderCurrentView();
    setInterval(updateClocks, 1000);
    setInterval(() => { state.currentDate = new Date(); updateClocks(); }, 60000);
}

document.addEventListener('DOMContentLoaded', () => {
    init().catch(err => console.error(err));
});