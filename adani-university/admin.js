/* ══════════════════════════════════════════════════════
   ADANI UNIVERSITY — admin.js
   Netlify Forms Integration & Admin Portal Logic
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Default Netlify Configuration
  const DEFAULT_CONFIG = {
    formId: '6abdd87aae74e90008eecceb',
    accessToken: 'nfp_uw5wgCXUqFXVtP8By57Yj7cJH959nHer084e',
    autoRefresh: false
  };

  // State
  let config = {
    formId: localStorage.getItem('au_admin_form_id') || DEFAULT_CONFIG.formId,
    accessToken: localStorage.getItem('au_admin_token') || DEFAULT_CONFIG.accessToken
  };

  let allSubmissions = [];
  let currentView = 'table'; // 'table' or 'cards'
  let autoRefreshTimer = null;
  let useSampleData = false;

  // Local overrides (status and admin notes stored in localStorage)
  function getLocalOverrides() {
    try {
      return JSON.parse(localStorage.getItem('au_submission_overrides') || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveLocalOverride(id, key, val) {
    const data = getLocalOverrides();
    if (!data[id]) data[id] = {};
    data[id][key] = val;
    localStorage.setItem('au_submission_overrides', JSON.stringify(data));
  }

  // Realistic Sample Data for testing/preview when form has 0 entries
  const SAMPLE_SUBMISSIONS = [
    {
      id: 'sub_demo_01',
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
      data: {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@gmail.com',
        subject: 'admission',
        message: 'Hello, I have scored 94.6 percentile in GUJCET 2026. I am interested in B.Tech Computer Science & Engineering (AI/ML). Could you share the cutoff trends, fee structure, and scholarship criteria?'
      }
    },
    {
      id: 'sub_demo_02',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      data: {
        name: 'Pooja Sharma',
        email: 'pooja.sharma@outlook.com',
        subject: 'hostel',
        message: 'Kindly provide information regarding on-campus girls hostel accommodation for 1st-year students, room sharing options (AC / Non-AC), and annual mess charges.'
      }
    },
    {
      id: 'sub_demo_03',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      data: {
        name: 'Rohan Trivedi',
        email: 'rohan.trivedi99@yahoo.com',
        subject: 'fees',
        message: 'Inquiring about merit-cum-means scholarships for undergraduate engineering students and installment schedules for tuition fees.'
      }
    },
    {
      id: 'sub_demo_04',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      data: {
        name: 'Ananya Patel',
        email: 'ananya.p@gmail.com',
        subject: 'placements',
        message: 'Wanted to know the highest & median packages for the Faculty of Management Sciences (MBA) batch 2025-26 and top corporate recruiters from Adani Group.'
      }
    },
    {
      id: 'sub_demo_05',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      data: {
        name: 'Devendra Joshi',
        email: 'devendra.j@gmail.com',
        subject: 'academics',
        message: 'Requesting the academic calendar for Odd Semester 2026-27 and information on student exchange programs with international universities.'
      }
    }
  ];

  // DOM Elements
  const tableBody = document.getElementById('submissions-table-body');
  const cardsContainer = document.getElementById('cards-container');
  const emptyState = document.getElementById('empty-state');
  const statusIndicator = document.getElementById('status-indicator');
  const lastUpdatedEl = document.getElementById('last-updated');
  const refreshBtn = document.getElementById('refresh-btn');
  const searchInput = document.getElementById('search-input');
  const topicFilter = document.getElementById('topic-filter');
  const statusFilter = document.getElementById('status-filter');
  const sortFilter = document.getElementById('sort-filter');
  const sampleDataBtn = document.getElementById('sample-data-btn');

  // Metrics
  const countTotalEl = document.getElementById('metric-total');
  const countAdmissionEl = document.getElementById('metric-admissions');
  const countAcademicsEl = document.getElementById('metric-academics');
  const countHostelEl = document.getElementById('metric-hostel');
  const countPendingEl = document.getElementById('metric-pending');

  // Modal elements
  const detailModal = document.getElementById('detail-modal');
  const settingsModal = document.getElementById('settings-modal');
  const addStudentModal = document.getElementById('add-student-modal');
  const toastEl = document.getElementById('toast');

  // ─── Fetch Submissions from Netlify API ──────────────
  async function fetchSubmissions() {
    refreshBtn.classList.add('loading');
    refreshBtn.querySelector('.btn-text').textContent = 'Fetching…';

    try {
      const url = `https://api.netlify.com/api/v1/forms/${config.formId}/submissions`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const liveData = await res.json();
      statusIndicator.querySelector('.status-dot').className = 'status-dot';
      statusIndicator.querySelector('span:last-child').textContent = 'Connected (Netlify)';

      // Merge local manual additions if any
      const localManual = JSON.parse(localStorage.getItem('au_manual_submissions') || '[]');
      
      if (useSampleData) {
        allSubmissions = [...liveData, ...SAMPLE_SUBMISSIONS, ...localManual];
      } else {
        allSubmissions = [...liveData, ...localManual];
      }

      lastUpdatedEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      renderData();
      showToast('Data refreshed successfully');
    } catch (err) {
      console.error('Failed to fetch from Netlify:', err);
      statusIndicator.querySelector('.status-dot').className = 'status-dot error';
      statusIndicator.querySelector('span:last-child').textContent = 'API Error';

      // Fallback to sample/local data if API network error occurs
      const localManual = JSON.parse(localStorage.getItem('au_manual_submissions') || '[]');
      allSubmissions = useSampleData ? [...SAMPLE_SUBMISSIONS, ...localManual] : localManual;
      renderData();
      showToast('Could not reach Netlify API. Check Token or Form ID.', true);
    } finally {
      refreshBtn.classList.remove('loading');
      refreshBtn.querySelector('.btn-text').textContent = 'Refresh';
    }
  }

  // ─── Filter & Process Submissions ───────────────────
  function getFilteredSubmissions() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const topic = topicFilter.value;
    const status = statusFilter.value;
    const sort = sortFilter.value;

    const overrides = getLocalOverrides();

    let filtered = allSubmissions.filter(item => {
      const data = item.data || {};
      const name = (data.name || item.name || '').toLowerCase();
      const email = (data.email || item.email || '').toLowerCase();
      const subj = (data.subject || '').toLowerCase();
      const msg = (data.message || item.summary || item.body || '').toLowerCase();

      // Search match
      if (q && !name.includes(q) && !email.includes(q) && !subj.includes(q) && !msg.includes(q)) {
        return false;
      }

      // Topic match
      if (topic !== 'all' && subj !== topic) {
        return false;
      }

      // Status match
      const currentStatus = (overrides[item.id] && overrides[item.id].status) || 'new';
      if (status !== 'all' && currentStatus !== status) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime() || 0;
      const dateB = new Date(b.created_at).getTime() || 0;
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }

  // ─── Update Metrics Bar ──────────────────────────────
  function updateMetrics() {
    const overrides = getLocalOverrides();
    let total = allSubmissions.length;
    let admissions = 0;
    let academics = 0;
    let hostel = 0;
    let pending = 0;

    allSubmissions.forEach(sub => {
      const d = sub.data || {};
      const subj = (d.subject || '').toLowerCase();
      if (subj === 'admission') admissions++;
      if (subj === 'academics' || subj === 'fees') academics++;
      if (subj === 'hostel') hostel++;

      const st = (overrides[sub.id] && overrides[sub.id].status) || 'new';
      if (st === 'new' || st === 'review') pending++;
    });

    countTotalEl.textContent = total;
    countAdmissionEl.textContent = admissions;
    countAcademicsEl.textContent = academics;
    countHostelEl.textContent = hostel;
    countPendingEl.textContent = pending;
  }

  // ─── Render View (Table / Cards) ────────────────────
  function renderData() {
    updateMetrics();
    const list = getFilteredSubmissions();
    const overrides = getLocalOverrides();

    if (list.length === 0) {
      document.getElementById('table-wrapper').style.display = 'none';
      cardsContainer.style.display = 'none';
      emptyState.style.display = 'block';

      if (allSubmissions.length === 0 && !useSampleData) {
        emptyState.querySelector('h3').textContent = 'No Submissions Found Yet';
        emptyState.querySelector('p').textContent = 'Your Netlify form currently has 0 live submissions. You can submit the contact form on your campus website, or click "Load Sample Records" to test the admin dashboard.';
      } else {
        emptyState.querySelector('h3').textContent = 'No Matching Records';
        emptyState.querySelector('p').textContent = 'Try changing or clearing your search keywords and filters.';
      }
      return;
    }

    emptyState.style.display = 'none';

    if (currentView === 'table') {
      document.getElementById('table-wrapper').style.display = 'block';
      cardsContainer.style.display = 'none';
      renderTable(list, overrides);
    } else {
      document.getElementById('table-wrapper').style.display = 'none';
      cardsContainer.style.display = 'grid';
      renderCards(list, overrides);
    }
  }

  // Render Table
  function renderTable(list, overrides) {
    tableBody.innerHTML = list.map((item, idx) => {
      const data = item.data || {};
      const name = data.name || item.name || 'Anonymous Student';
      const email = data.email || item.email || 'No email';
      const subject = data.subject || 'other';
      const message = data.message || item.summary || item.body || '(No message content)';
      const dateStr = formatRelativeTime(item.created_at);
      const initial = name.charAt(0).toUpperCase();

      const itemStatus = (overrides[item.id] && overrides[item.id].status) || 'new';

      return `
        <tr data-id="${item.id}">
          <td>
            <div class="student-col">
              <div class="avatar">${initial}</div>
              <div class="student-meta">
                <span class="student-name">${escapeHTML(name)}</span>
                <a href="mailto:${escapeHTML(email)}" class="student-email">${escapeHTML(email)}</a>
              </div>
            </div>
          </td>
          <td>
            <span class="topic-badge topic-${escapeHTML(subject.toLowerCase())}">${escapeHTML(subject)}</span>
          </td>
          <td>
            <div class="message-preview" title="${escapeHTML(message)}">${escapeHTML(message)}</div>
          </td>
          <td>
            <select class="status-select" data-action="status" data-id="${item.id}">
              <option value="new" ${itemStatus === 'new' ? 'selected' : ''}>🔵 New</option>
              <option value="review" ${itemStatus === 'review' ? 'selected' : ''}>🟡 In Review</option>
              <option value="contacted" ${itemStatus === 'contacted' ? 'selected' : ''}>🟣 Contacted</option>
              <option value="resolved" ${itemStatus === 'resolved' ? 'selected' : ''}>🟢 Resolved</option>
            </select>
          </td>
          <td class="time-cell">${dateStr}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-outline btn-sm" data-action="view" data-id="${item.id}" title="View details">👁️ View</button>
              <a href="mailto:${escapeHTML(email)}?subject=${encodeURIComponent('Adani University: Regarding your ' + subject + ' query')}" class="btn btn-outline btn-sm" title="Reply via Email">✉️ Reply</a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Cards
  function renderCards(list, overrides) {
    cardsContainer.innerHTML = list.map(item => {
      const data = item.data || {};
      const name = data.name || item.name || 'Anonymous Student';
      const email = data.email || item.email || 'No email';
      const subject = data.subject || 'other';
      const message = data.message || item.summary || item.body || '(No message content)';
      const dateStr = formatRelativeTime(item.created_at);
      const initial = name.charAt(0).toUpperCase();

      const itemStatus = (overrides[item.id] && overrides[item.id].status) || 'new';

      return `
        <div class="inquiry-card" data-id="${item.id}">
          <div class="card-header">
            <div class="student-col">
              <div class="avatar">${initial}</div>
              <div class="student-meta">
                <span class="student-name">${escapeHTML(name)}</span>
                <span class="time-cell">${dateStr}</span>
              </div>
            </div>
            <span class="topic-badge topic-${escapeHTML(subject.toLowerCase())}">${escapeHTML(subject)}</span>
          </div>
          <a href="mailto:${escapeHTML(email)}" class="student-email">📧 ${escapeHTML(email)}</a>
          <div class="card-body">
            "${escapeHTML(message)}"
          </div>
          <div class="card-footer">
            <select class="status-select" data-action="status" data-id="${item.id}">
              <option value="new" ${itemStatus === 'new' ? 'selected' : ''}>🔵 New</option>
              <option value="review" ${itemStatus === 'review' ? 'selected' : ''}>🟡 In Review</option>
              <option value="contacted" ${itemStatus === 'contacted' ? 'selected' : ''}>🟣 Contacted</option>
              <option value="resolved" ${itemStatus === 'resolved' ? 'selected' : ''}>🟢 Resolved</option>
            </select>
            <div class="action-btns">
              <button class="btn btn-outline btn-sm" data-action="view" data-id="${item.id}">Details</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── Detail Modal ────────────────────────────────────
  function openDetailModal(id) {
    const item = allSubmissions.find(s => s.id === id);
    if (!item) return;

    const data = item.data || {};
    const name = data.name || item.name || 'Anonymous Student';
    const email = data.email || item.email || 'No email';
    const subject = data.subject || 'other';
    const message = data.message || item.summary || item.body || '(No message content)';
    const fullDate = new Date(item.created_at).toLocaleString();

    const overrides = getLocalOverrides();
    const itemStatus = (overrides[id] && overrides[id].status) || 'new';
    const itemNotes = (overrides[id] && overrides[id].notes) || '';

    document.getElementById('modal-student-name').textContent = name;
    document.getElementById('modal-student-email').textContent = email;
    document.getElementById('modal-student-email').href = `mailto:${email}`;
    document.getElementById('modal-student-subject').textContent = subject;
    document.getElementById('modal-student-date').textContent = fullDate;
    document.getElementById('modal-student-message').textContent = message;

    const notesTextarea = document.getElementById('modal-admin-notes');
    notesTextarea.value = itemNotes;
    notesTextarea.dataset.id = id;

    const modalStatusSelect = document.getElementById('modal-status-select');
    modalStatusSelect.value = itemStatus;
    modalStatusSelect.dataset.id = id;

    const replyBtn = document.getElementById('modal-reply-btn');
    replyBtn.href = `mailto:${email}?subject=${encodeURIComponent('Adani University Admissions & Inquiries: Re ' + subject)}`;

    detailModal.classList.add('open');
  }

  // ─── Helpers ─────────────────────────────────────────
  function formatRelativeTime(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg, isError = false) {
    toastEl.textContent = (isError ? '⚠️ ' : '✅ ') + msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  // ─── Export Features ─────────────────────────────────
  function exportCSV() {
    const list = getFilteredSubmissions();
    const overrides = getLocalOverrides();
    if (!list.length) {
      showToast('No submissions to export', true);
      return;
    }

    const headers = ['ID', 'Date', 'Full Name', 'Email', 'Topic', 'Status', 'Message', 'Admin Notes'];
    const rows = list.map(item => {
      const d = item.data || {};
      const status = (overrides[item.id] && overrides[item.id].status) || 'new';
      const notes = (overrides[item.id] && overrides[item.id].notes) || '';
      return [
        item.id,
        new Date(item.created_at).toLocaleString(),
        `"${(d.name || item.name || '').replace(/"/g, '""')}"`,
        `"${(d.email || item.email || '').replace(/"/g, '""')}"`,
        `"${(d.subject || '').replace(/"/g, '""')}"`,
        `"${status}"`,
        `"${(d.message || item.summary || '').replace(/"/g, '""')}"`,
        `"${notes.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adani_university_inquiries_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully');
  }

  function exportJSON() {
    const list = getFilteredSubmissions();
    if (!list.length) {
      showToast('No submissions to export', true);
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(list, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `adani_university_inquiries_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported JSON successfully');
  }

  // ─── Event Listeners ─────────────────────────────────
  // Refresh click
  refreshBtn.addEventListener('click', fetchSubmissions);

  // Filters & Search
  searchInput.addEventListener('input', renderData);
  topicFilter.addEventListener('change', renderData);
  statusFilter.addEventListener('change', renderData);
  sortFilter.addEventListener('change', renderData);

  // Sample data toggle
  sampleDataBtn.addEventListener('click', () => {
    useSampleData = !useSampleData;
    sampleDataBtn.classList.toggle('active', useSampleData);
    sampleDataBtn.textContent = useSampleData ? '⚡ Using Sample Records' : '⚡ Load Sample Records';
    fetchSubmissions();
  });

  // Table actions delegation (status select & view modal)
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-action="status"]')) {
      const id = e.target.dataset.id;
      const status = e.target.value;
      saveLocalOverride(id, 'status', status);
      updateMetrics();
      showToast(`Status updated to "${status}"`);
    }
  });

  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('[data-action="view"]');
    if (viewBtn) {
      openDetailModal(viewBtn.dataset.id);
    }
  });

  // Notes and Status in modal
  document.getElementById('modal-admin-notes').addEventListener('input', (e) => {
    const id = e.target.dataset.id;
    if (id) {
      saveLocalOverride(id, 'notes', e.target.value);
    }
  });

  document.getElementById('modal-status-select').addEventListener('change', (e) => {
    const id = e.target.dataset.id;
    if (id) {
      saveLocalOverride(id, 'status', e.target.value);
      renderData();
    }
  });

  // View switch (table vs cards)
  document.getElementById('btn-view-table').addEventListener('click', () => {
    currentView = 'table';
    document.getElementById('btn-view-table').classList.add('active');
    document.getElementById('btn-view-cards').classList.remove('active');
    renderData();
  });

  document.getElementById('btn-view-cards').addEventListener('click', () => {
    currentView = 'cards';
    document.getElementById('btn-view-cards').classList.add('active');
    document.getElementById('btn-view-table').classList.remove('active');
    renderData();
  });

  // Exports
  document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
  document.getElementById('export-json-btn').addEventListener('click', exportJSON);
  document.getElementById('print-btn').addEventListener('click', () => window.print());

  // Close Modals
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('modal-close')) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
      }
    });
  });

  // Settings Modal
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('cfg-form-id').value = config.formId;
    document.getElementById('cfg-token').value = config.accessToken;
    settingsModal.classList.add('open');
  });

  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const newFormId = document.getElementById('cfg-form-id').value.trim();
    const newToken = document.getElementById('cfg-token').value.trim();
    if (!newFormId || !newToken) {
      showToast('Form ID and Token are required', true);
      return;
    }
    config.formId = newFormId;
    config.accessToken = newToken;
    localStorage.setItem('au_admin_form_id', newFormId);
    localStorage.setItem('au_admin_token', newToken);
    settingsModal.classList.remove('open');
    showToast('Settings saved. Refreshing…');
    fetchSubmissions();
  });

  // Add Manual Student Record
  document.getElementById('add-manual-btn').addEventListener('click', () => {
    addStudentModal.classList.add('open');
  });

  document.getElementById('add-student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('manual-name').value.trim();
    const email = document.getElementById('manual-email').value.trim();
    const subject = document.getElementById('manual-subject').value;
    const message = document.getElementById('manual-message').value.trim();

    if (!name || !email) {
      showToast('Name and email are required', true);
      return;
    }

    const newRecord = {
      id: 'manual_' + Date.now(),
      created_at: new Date().toISOString(),
      data: { name, email, subject, message }
    };

    const localManual = JSON.parse(localStorage.getItem('au_manual_submissions') || '[]');
    localManual.unshift(newRecord);
    localStorage.setItem('au_manual_submissions', JSON.stringify(localManual));

    addStudentModal.classList.remove('open');
    document.getElementById('add-student-form').reset();
    showToast('Student inquiry added');
    fetchSubmissions();
  });

  // Dark/Light Theme Switch
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('au_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';

  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('au_theme', next);
    themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
  });

  // Initialize
  fetchSubmissions();

  // Auto-refresh every 45s
  setInterval(fetchSubmissions, 45000);
})();
