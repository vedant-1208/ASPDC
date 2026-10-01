/* ══════════════════════════════════════════════════════
   ADANI UNIVERSITY — script.js
   All interactive features
══════════════════════════════════════════════════════ */

'use strict';

// ─── 1. DOM Ready ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initHeroParticles();
  initCountUpStats();
  initScrollSpy();
  initFoodMenu();
  initCampusMap();
  initCGPACalculator();
  initClubs();
  initTimetable();
  initCountdown();
  initNotices();
  initContactForm();
  initBackToTop();
  initMobileMenu();
});

// ─── 2. Navbar ────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    lastY = y;
  }, { passive: true });
}

// ─── 3. Theme Toggle ─────────────────────────────────
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const icon = btn.querySelector('.theme-icon');
  const stored = localStorage.getItem('au-theme');
  if (stored === 'light') { document.body.classList.add('light'); icon.textContent = '☀️'; }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    icon.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('au-theme', isLight ? 'light' : 'dark');
  });
}

// ─── 4. Mobile Menu ──────────────────────────────────
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

// ─── 5. Hero Particles ───────────────────────────────
function initHeroParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      --dur:   ${3 + Math.random() * 5}s;
      --delay: ${Math.random() * 4}s;
      width:  ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      opacity: ${0.2 + Math.random() * 0.6};
    `;
    container.appendChild(p);
  }
}

// ─── 6. Count-Up Stats ───────────────────────────────
function initCountUpStats() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const target = +entry.target.dataset.target;
      const duration = 1800;
      const step = 16;
      const steps = duration / step;
      let current = 0;
      const increment = target / steps;
      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        entry.target.textContent = Math.round(current).toLocaleString('en-IN') + '+';
        if (current >= target) clearInterval(timer);
      }, step);
    });
  }, { threshold: 0.5 });
  stats.forEach(s => observer.observe(s));
}

// ─── 7. Scroll Spy ───────────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ─── 8. Food Menu ────────────────────────────────────
const FOOD_ITEMS = [
  { name: 'Dal Makhani',     price: '₹60',  cat: 'north'   },
  { name: 'Butter Naan',     price: '₹25',  cat: 'north'   },
  { name: 'Rajma Chawal',    price: '₹55',  cat: 'north'   },
  { name: 'Paneer Tikka',    price: '₹80',  cat: 'north'   },
  { name: 'Masala Dosa',     price: '₹45',  cat: 'south'   },
  { name: 'Idli Sambar (3)', price: '₹35',  cat: 'south'   },
  { name: 'Uttapam',         price: '₹50',  cat: 'south'   },
  { name: 'Filter Coffee',   price: '₹20',  cat: 'south'   },
  { name: 'Veg Burger',      price: '₹50',  cat: 'fast'    },
  { name: 'French Fries',    price: '₹40',  cat: 'fast'    },
  { name: 'Maggi Noodles',   price: '₹30',  cat: 'fast'    },
  { name: 'Momos (6 pcs)',   price: '₹60',  cat: 'fast'    },
  { name: 'Green Salad Bowl',price: '₹65',  cat: 'healthy' },
  { name: 'Fruit Bowl',      price: '₹55',  cat: 'healthy' },
  { name: 'Smoothie',        price: '₹70',  cat: 'healthy' },
  { name: 'Oats Porridge',   price: '₹40',  cat: 'healthy' },
];

function initFoodMenu() {
  const grid    = document.getElementById('food-menu-grid');
  const filters = document.querySelectorAll('.food-filter');
  if (!grid) return;

  const render = (cat) => {
    const items = cat === 'all' ? FOOD_ITEMS : FOOD_ITEMS.filter(i => i.cat === cat);
    grid.innerHTML = items.map(item => `
      <div class="menu-item">
        <span>${item.name}</span>
        <span class="price">${item.price}</span>
      </div>
    `).join('');
  };

  render('all');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      render(btn.dataset.filter);
    });
  });
}

// ─── 9. Campus Map ────────────────────────────────────
const BUILDING_DATA = {
  'main':         { icon: '🏛️',  name: 'Main Academic Block',   desc: 'Houses School of Engineering, Management, Science & Design across Blocks A, B, C.', meta: ['⏰ Mon–Sat 8 AM–6 PM', '📍 Centre Campus', '♿ Accessible'] },
  'library':      { icon: '📚',  name: 'Central Library',        desc: '3-storey library with 1,00,000+ books, e-journals, reading zones and printing services.', meta: ['⏰ 24/7', '📍 North Block', '💻 Wi-Fi enabled'] },
  'admin':        { icon: '🏢',  name: 'Administrative Block',   desc: 'Academic office, registrar, exam cell, fee payment, and student affairs department.', meta: ['⏰ Mon–Fri 9 AM–5 PM', '📍 Block D', '📞 Helpline: 040-xxxx'] },
  'hostel-boys':  { icon: '🏠',  name: 'Boys Hostel',            desc: 'Fully furnished rooms with attached bathrooms, Wi-Fi, laundry, and 24-hr security.', meta: ['⏰ Gates close 10 PM', '📍 West Wing', '🛡️ CCTV Monitored'] },
  'hostel-girls': { icon: '🏡',  name: 'Girls Hostel',           desc: 'Safe & secure hostel for female students with lady warden, mess and recreational area.', meta: ['⏰ Gates close 9 PM', '📍 East Wing', '🛡️ Secure Entry'] },
  'sports':       { icon: '⚽',  name: 'Sports Complex',         desc: 'Olympic-standard facilities: football ground, basketball court, tennis court, gymnasium, swimming pool.', meta: ['⏰ 6 AM–8 PM', '📍 South End', '🏋️ Gym inside'] },
  'food':         { icon: '🍽️', name: 'Central Food Court',     desc: '600-seat food court with 10+ stalls serving North & South Indian, Chinese, fast food, and healthy options.', meta: ['⏰ 7 AM–10 PM', '📍 Centre Block', '💳 Meal card accepted'] },
  'auditorium':   { icon: '🎭',  name: 'Main Auditorium',        desc: 'State-of-the-art 2000-capacity auditorium for cultural events, convocations and guest lectures.', meta: ['⏰ Event days only', '📍 West Block', '🎤 Pro AV setup'] },
  'lab':          { icon: '🔬',  name: 'Innovation Lab',         desc: '500+ workstations, maker space, 3D printers, robotics lab and AI/ML research computing cluster.', meta: ['⏰ 8 AM–9 PM', '📍 East Block', '🖥️ High-speed servers'] },
  'medical':      { icon: '🏥',  name: 'Medical Centre',         desc: '24-hour campus health centre with doctors, nurse, ambulance facility and basic pharmacy.', meta: ['⏰ 24 Hours', '📍 Main Gate West', '🚑 Emergency: 108'] },
};

function initCampusMap() {
  const buildings = document.querySelectorAll('.map-building');
  const tooltip   = document.getElementById('map-tooltip');
  const detailEl  = document.getElementById('building-detail');
  const defaultEl = document.querySelector('.building-default-state');

  buildings.forEach(bldg => {
    const key = bldg.dataset.building;
    const data = BUILDING_DATA[key];
    if (!data) return;

    bldg.addEventListener('mouseenter', (e) => {
      const rect = bldg.closest('svg').getBoundingClientRect();
      const mapRect = bldg.closest('.campus-map').getBoundingClientRect();
      tooltip.textContent = data.name;
      const cx = e.clientX - mapRect.left;
      const cy = e.clientY - mapRect.top;
      tooltip.style.left = `${cx + 10}px`;
      tooltip.style.top  = `${cy - 30}px`;
      tooltip.style.opacity = '1';
    });
    bldg.addEventListener('mousemove', (e) => {
      const mapRect = bldg.closest('.campus-map').getBoundingClientRect();
      tooltip.style.left = `${e.clientX - mapRect.left + 10}px`;
      tooltip.style.top  = `${e.clientY - mapRect.top - 30}px`;
    });
    bldg.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    bldg.addEventListener('click', () => {
      defaultEl.style.display = 'none';
      detailEl.hidden = false;
      document.getElementById('detail-icon').textContent  = data.icon;
      document.getElementById('detail-name').textContent  = data.name;
      document.getElementById('detail-desc').textContent  = data.desc;
      document.getElementById('detail-meta').innerHTML = data.meta.map(m => `<span>${m}</span>`).join('');

      // Highlight selected
      buildings.forEach(b => b.style.filter = '');
      bldg.style.filter = 'brightness(1.8) drop-shadow(0 0 6px rgba(79,195,247,0.8))';
    });
  });
}

// ─── 10. CGPA Calculator ─────────────────────────────
function initCGPACalculator() {
  // Tabs
  const tabs   = document.querySelectorAll('.cgpa-tab');
  const panels = document.querySelectorAll('.cgpa-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(`panel-${tab.dataset.tab}`);
      if (target) { target.classList.add('active'); target.hidden = false; }
    });
  });

  // SGPA
  let subjectCount = 0;
  const addSubjectBtn = document.getElementById('add-subject-btn');
  const subjectsList  = document.getElementById('subjects-list');

  const addSubjectRow = () => {
    subjectCount++;
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.innerHTML = `
      <input type="text"   class="calc-input sub-name" placeholder="Subject ${subjectCount}" aria-label="Subject name" />
      <input type="number" class="calc-input sub-credits" placeholder="Credits" min="1" max="6" aria-label="Credits" />
      <select class="calc-input sub-grade" aria-label="Grade">
        <option value="10">O (10)</option>
        <option value="9">A+ (9)</option>
        <option value="8" selected>A (8)</option>
        <option value="7">B+ (7)</option>
        <option value="6">B (6)</option>
        <option value="5">C (5)</option>
        <option value="4">P (4)</option>
        <option value="0">F (0)</option>
      </select>
      <button class="remove-btn" title="Remove subject" aria-label="Remove subject">×</button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
    subjectsList.appendChild(row);
  };

  // Add 4 default rows
  for (let i = 0; i < 4; i++) addSubjectRow();
  addSubjectBtn.addEventListener('click', addSubjectRow);

  document.getElementById('calc-sgpa-btn').addEventListener('click', () => {
    const rows = subjectsList.querySelectorAll('.subject-row');
    let totalCredits = 0, totalPoints = 0;
    rows.forEach(row => {
      const credits = parseFloat(row.querySelector('.sub-credits').value) || 0;
      const grade   = parseFloat(row.querySelector('.sub-grade').value) || 0;
      totalCredits += credits;
      totalPoints  += credits * grade;
    });
    if (totalCredits === 0) return;
    const sgpa = (totalPoints / totalCredits).toFixed(2);
    document.getElementById('sgpa-value').textContent = sgpa;
    document.getElementById('sgpa-grade').textContent = getGradeLabel(parseFloat(sgpa));
    updateMeter(parseFloat(sgpa));
  });

  // CGPA
  let semCount = 0;
  const addSemBtn      = document.getElementById('add-sem-btn');
  const semestersList  = document.getElementById('semesters-list');

  const addSemRow = () => {
    semCount++;
    const row = document.createElement('div');
    row.className = 'sem-row';
    row.innerHTML = `
      <input type="text"   class="calc-input" placeholder="Semester ${semCount}" aria-label="Semester name" />
      <input type="number" class="calc-input sem-sgpa" placeholder="GPA" min="0" max="10" step="0.01" aria-label="GPA for semester" />
      <button class="remove-btn" title="Remove semester" aria-label="Remove semester">×</button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
    semestersList.appendChild(row);
  };

  for (let i = 0; i < 3; i++) addSemRow();
  addSemBtn.addEventListener('click', addSemRow);

  document.getElementById('calc-cgpa-btn').addEventListener('click', () => {
    const rows = semestersList.querySelectorAll('.sem-row');
    let total = 0, count = 0;
    rows.forEach(row => {
      const gpa = parseFloat(row.querySelector('.sem-sgpa').value);
      if (!isNaN(gpa) && gpa >= 0 && gpa <= 10) { total += gpa; count++; }
    });
    if (count === 0) return;
    const cgpa = (total / count).toFixed(2);
    document.getElementById('cgpa-value').textContent = cgpa;
    document.getElementById('cgpa-grade').textContent = getGradeLabel(parseFloat(cgpa));
    updateMeter(parseFloat(cgpa));
  });

  // Percentage converter
  document.getElementById('convert-pct-btn').addEventListener('click', () => {
    const pct = parseFloat(document.getElementById('pct-input').value);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    // Standard formula: CGPA = (Percentage - 7.5) / 9.5
    const cgpa = Math.max(0, ((pct - 7.5) / 9.5)).toFixed(2);
    const result = document.getElementById('pct-cgpa-value');
    result.textContent = cgpa;
    updateMeter(parseFloat(cgpa));
  });
}

function getGradeLabel(gpa) {
  if (gpa >= 9.5)  return '🏆 Outstanding — Dean\'s List';
  if (gpa >= 9.0)  return '⭐ Excellent — First Class with Distinction';
  if (gpa >= 8.0)  return '✅ Very Good — First Class';
  if (gpa >= 7.0)  return '👍 Good — Second Class';
  if (gpa >= 6.0)  return '📘 Above Average';
  if (gpa >= 5.0)  return '📗 Average — Pass';
  if (gpa >= 4.0)  return '⚠️ Below Average — Conditional Pass';
  return '❌ Fail — Backlog';
}

function updateMeter(gpa) {
  const arc = document.getElementById('meter-arc');
  const display = document.getElementById('meter-display');
  if (!arc) return;
  const totalLen = 251;
  const offset = totalLen - (totalLen * Math.min(gpa, 10) / 10);
  arc.style.strokeDashoffset = offset;
  display.textContent = gpa.toFixed(1);
}

// ─── 11. Clubs ───────────────────────────────────────
const CLUBS_DATA = [
  { icon: '🤖', name: 'Robotics Club',      desc: 'Build and program robots for national competitions.', members: '120 members', cat: 'tech'   },
  { icon: '💻', name: 'Coding Club',         desc: 'Competitive programming, hackathons and open source.', members: '200 members', cat: 'tech'   },
  { icon: '🤖', name: 'AI/ML Society',       desc: 'Machine learning projects and paper reading groups.', members: '90 members',  cat: 'tech'   },
  { icon: '🔌', name: 'IEEE Student Branch', desc: 'Technical workshops, seminars and conferences.', members: '150 members', cat: 'tech'   },
  { icon: '🎭', name: 'Drama Club',          desc: 'Theatre productions, mono-acts and street plays.', members: '80 members',  cat: 'arts'   },
  { icon: '🎵', name: 'Music Club',          desc: 'Western, Indian classical, band performances.', members: '110 members', cat: 'arts'   },
  { icon: '🎨', name: 'Fine Arts Club',      desc: 'Painting, sketching, digital art and sculpting.', members: '70 members',  cat: 'arts'   },
  { icon: '📸', name: 'Photography Club',    desc: 'Photography, film-making and editing workshops.', members: '95 members',  cat: 'arts'   },
  { icon: '⚽', name: 'Football Club',       desc: 'Regular practices, inter-college tournaments.', members: '60 members',  cat: 'sports' },
  { icon: '🏏', name: 'Cricket Club',        desc: 'T20 tournaments, training camps and coaching.', members: '75 members',  cat: 'sports' },
  { icon: '🏀', name: 'Basketball Club',     desc: 'State-level competitions and coaching sessions.', members: '45 members',  cat: 'sports' },
  { icon: '♟️', name: 'Chess Club',          desc: 'Online & offline tournaments, strategy sessions.', members: '55 members',  cat: 'sports' },
  { icon: '🌱', name: 'Eco Warriors',        desc: 'Tree plantation, zero-waste drives on campus.', members: '130 members', cat: 'social' },
  { icon: '🩸', name: 'Blood Donation Cell', desc: 'Organises regular blood donation camps.', members: '200 members', cat: 'social' },
  { icon: '📚', name: 'NGO Club',            desc: 'Teaching underprivileged children every weekend.', members: '85 members',  cat: 'social' },
  { icon: '🗣️', name: 'Debate Society',      desc: 'Parliamentary debates, Model UN and elocution.', members: '100 members', cat: 'social' },
];

function initClubs() {
  const grid = document.getElementById('clubs-grid');
  const filterBtns = document.querySelectorAll('.club-filter-btn');
  if (!grid) return;

  const render = (cat) => {
    const items = cat === 'all' ? CLUBS_DATA : CLUBS_DATA.filter(c => c.cat === cat);
    grid.innerHTML = items.map((c, i) => `
      <div class="club-card" style="animation-delay:${i * 0.05}s">
        <div class="club-icon">${c.icon}</div>
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
        <span class="club-members">👥 ${c.members}</span>
      </div>
    `).join('');
  };

  render('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.clubCat);
    });
  });
}

// ─── 12. Timetable ───────────────────────────────────
const TIMETABLES = {
  cse: {
    3: [
      ['8:00–9:00',  'Data Structures\nDr. Shah',    'Discrete Math\nDr. Patel',    'Data Structures\nDr. Shah',    'DBMS\nDr. Joshi',       'OOP (Java)\nDr. Mehta',   'BREAK'],
      ['9:00–10:00', 'Discrete Math\nDr. Patel',     'OOP (Java)\nDr. Mehta',       'DBMS\nDr. Joshi',              'OS Theory\nDr. Kumar',  'Data Structures\nDr. Shah','BREAK'],
      ['10:00–11:00','DS Lab\nDr. Shah',              'DS Lab\nDr. Shah',             'OOP Lab\nDr. Mehta',           'OOP Lab\nDr. Mehta',    'DBMS Lab\nDr. Joshi',     'BREAK'],
      ['11:00–11:15','BREAK','BREAK','BREAK','BREAK','BREAK','BREAK'],
      ['11:15–12:15','OS Theory\nDr. Kumar',         'DBMS\nDr. Joshi',              'Discrete Math\nDr. Patel',    'OOP (Java)\nDr. Mehta', 'OS Lab\nDr. Kumar',       'BREAK'],
      ['12:15–1:00', 'LUNCH','LUNCH','LUNCH','LUNCH','LUNCH','BREAK'],
      ['1:00–2:00',  'English Comm.\nDr. Rao',       'OS Lab\nDr. Kumar',            'English Comm.\nDr. Rao',       'DBMS Lab\nDr. Joshi',   'Sports/Club',             'BREAK'],
      ['2:00–3:00',  'Maths-III\nDr. Gupta',         'Maths-III\nDr. Gupta',         'Maths-III\nDr. Gupta',         'Sports/Club',           'English Comm.\nDr. Rao',  'BREAK'],
    ]
  },
  mech: {
    3: [
      ['8:00–9:00',  'Thermodynamics\nDr. Verma',  'Fluid Mech.\nDr. Singh',  'Thermodynamics\nDr. Verma','Manufacturing\nDr. Roy',   'Mech Design\nDr. Das',  'BREAK'],
      ['9:00–10:00', 'Fluid Mech.\nDr. Singh',     'Mech Design\nDr. Das',    'Manufacturing\nDr. Roy',   'Fluid Mech.\nDr. Singh',  'Thermo Lab\nDr. Verma', 'BREAK'],
      ['10:00–11:00','Thermo Lab\nDr. Verma',       'Thermo Lab\nDr. Verma',   'Fluid Lab\nDr. Singh',     'Fluid Lab\nDr. Singh',    'CAD Lab\nDr. Das',      'BREAK'],
      ['11:00–11:15','BREAK','BREAK','BREAK','BREAK','BREAK','BREAK'],
      ['11:15–12:15','Mech Design\nDr. Das',        'Manufacturing\nDr. Roy',   'Mech Design\nDr. Das',    'Thermodynamics\nDr. Verma','Manufacturing\nDr. Roy','BREAK'],
      ['12:15–1:00', 'LUNCH','LUNCH','LUNCH','LUNCH','LUNCH','BREAK'],
      ['1:00–2:00',  'Maths-III\nDr. Gupta',       'CAD Lab\nDr. Das',         'Maths-III\nDr. Gupta',    'Manufacturing Lab\nDr.Roy','Sports/Club',          'BREAK'],
      ['2:00–3:00',  'English Comm.\nDr. Rao',      'English Comm.\nDr. Rao',  'Sports/Club',              'Maths-III\nDr. Gupta',    'English Comm.\nDr. Rao','BREAK'],
    ]
  },
  mba: {
    3: [
      ['8:30–10:00', 'Marketing Mgmt\nProf. Sharma','Finance\nProf. Gupta',    'Marketing Mgmt\nProf. Sharma','HR Mgmt\nProf. Nair',   'Operations\nProf. Bose',  'BREAK'],
      ['10:00–11:30','Business Analytics\nProf. Shah','HR Mgmt\nProf. Nair',   'Finance\nProf. Gupta',        'Operations\nProf. Bose','Business Analytics\nProf.Shah','BREAK'],
      ['11:30–12:00','BREAK','BREAK','BREAK','BREAK','BREAK','BREAK'],
      ['12:00–1:30', 'Operations\nProf. Bose',      'Business Analytics\nProf. Shah','HR Mgmt\nProf. Nair','Finance\nProf. Gupta', 'Case Study\nAll Faculty',  'BREAK'],
      ['1:30–2:30',  'LUNCH','LUNCH','LUNCH','LUNCH','LUNCH','BREAK'],
      ['2:30–4:00',  'Case Study\nAll Faculty',     'Marketing Mgmt\nProf. Sharma','Elective',             'Case Study\nAll Faculty','Guest Lecture',           'BREAK'],
    ]
  }
};

function initTimetable() {
  const body = document.getElementById('timetable-body');
  const btn  = document.getElementById('load-timetable-btn');
  if (!body) return;

  const renderTimetable = () => {
    const branch = document.getElementById('tt-branch').value;
    const sem    = parseInt(document.getElementById('tt-sem').value);
    const data   = TIMETABLES[branch]?.[sem] || TIMETABLES['cse'][3];
    const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    body.innerHTML = data.map(row => {
      const [time, ...cells] = row;
      return `<tr>
        <td>${time}</td>
        ${cells.map((cell, i) => {
          if (i === 5) return `<td class="break" style="color:var(--text-muted)">Weekend</td>`;
          if (cell === 'BREAK' || cell === 'LUNCH') return `<td class="break">${cell}</td>`;
          const [subject, teacher] = cell.split('\n');
          return `<td class="class-cell"><strong>${subject}</strong><span>${teacher || ''}</span></td>`;
        }).join('')}
      </tr>`;
    }).join('');
  };

  renderTimetable();
  btn.addEventListener('click', renderTimetable);
}

// ─── 13. Countdown Timer ─────────────────────────────
function initCountdown() {
  const target = new Date('2025-11-14T09:00:00');
  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');

  const pad = n => String(Math.max(0, n)).padStart(2, '0');

  const tick = () => {
    const now  = new Date();
    const diff = target - now;
    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      return;
    }
    daysEl.textContent  = pad(Math.floor(diff / 86400000));
    hoursEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    minsEl.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
    secsEl.textContent  = pad(Math.floor((diff % 60000)    / 1000));
  };

  tick();
  setInterval(tick, 1000);
}

// ─── 14. Notices ─────────────────────────────────────
// Use real Adani University image URLs directly in notices
const NOTICES = [
  {
    tag:   'event',
    tagLabel: 'Event',
    img:   'https://www.adaniuni.ac.in/wp-content/uploads/2026/02/cultural-image.jpeg',
    title: 'Cultural Fest 2026 Highlights',
    desc:  'Recap of the annual cultural celebration with music, dance, drama and art exhibition.',
    date:  '15 Feb 2026'
  },
  {
    tag:   'academic',
    tagLabel: 'Academic',
    img:   'https://www.adaniuni.ac.in/wp-content/uploads/2026/09/Peer-Learning-Sparks-Mathematical-Curiosity-1.webp',
    title: 'Peer Learning Sparks Mathematical Curiosity',
    desc:  'Students lead collaborative learning sessions boosting engagement in advanced mathematics.',
    date:  '28 Sep 2026'
  },
  {
    tag:   'event',
    tagLabel: 'Event',
    img:   'https://www.adaniuni.ac.in/wp-content/uploads/2026/09/Adani-University-Inaugurates-NCC-Unit-1-1024x576.webp',
    title: 'Adani University Inaugurates NCC Unit',
    desc:  'A new NCC unit is officially launched, offering students structured defence training.',
    date:  '22 Sep 2026'
  },
  {
    tag:   'general',
    tagLabel: 'Campus',
    img:   'https://www.adaniuni.ac.in/wp-content/uploads/2026/09/Educational-Industry-Visit-to-eInfochips-1-1024x768.webp',
    title: 'Industry Visit to eInfochips',
    desc:  'Engineering students visited eInfochips Ahmedabad for hands-on industry exposure.',
    date:  '20 Sep 2026'
  },
  {
    tag:   'academic',
    tagLabel: 'Research',
    img:   'https://www.adaniuni.ac.in/wp-content/uploads/2026/09/Low-Cost-Sensors-for-Air-Quality-Monitoring-1024x524.webp',
    title: 'Low-Cost Sensors for Air Quality Monitoring',
    desc:  'AU researchers develop affordable IoT-based sensors for real-time environmental monitoring.',
    date:  '18 Sep 2026'
  },
  {
    tag:   'event',
    tagLabel: 'Alumni',
    img:   'https://www.adaniuni.ac.in/wp-content/uploads/2024/02/Dignitaries-with-the-convocating-batch-of-PGDM-2021-23-1024x683.jpg',
    title: 'PGDM 2021–23 Convocation Ceremony',
    desc:  'Distinguished dignitaries joined the PGDM graduating batch for a memorable convocation.',
    date:  '10 Feb 2024'
  },
];

function initNotices() {
  const grid = document.getElementById('notices-grid');
  if (!grid) return;
  grid.innerHTML = NOTICES.map(n => `
    <article class="notice-card">
      <div class="notice-img">
        <img src="${n.img}" alt="${n.title}" loading="lazy" />
      </div>
      <div class="notice-body">
        <span class="notice-tag ${n.tag}">${n.tagLabel}</span>
        <h4>${n.title}</h4>
        <p>${n.desc}</p>
        <span class="notice-date">📅 ${n.date}</span>
      </div>
    </article>
  `).join('');
}

// ─── 15. Contact Form ────────────────────────────────
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const formData = new FormData(form);
    if (!formData.get('form-name')) {
      formData.append('form-name', 'contact');
    }

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (res.ok || res.status === 200 || res.status === 302) {
        success.hidden = false;
        form.reset();
        setTimeout(() => { success.hidden = true; }, 7000);
      } else {
        // Fallback standard submit if AJAX failed
        form.submit();
      }
    } catch (err) {
      console.error('Submission failed, attempting standard submit', err);
      form.submit();
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ─── 16. Back To Top ─────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
