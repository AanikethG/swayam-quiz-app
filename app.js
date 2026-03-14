/* ============================================
   SWAYAM Quiz Hub — App Engine
   Vanilla JS · Hash Routing · No Dependencies
   ============================================ */

// ── State ──────────────────────────────────────
let subjects = [];
let currentSubjectId = '';
let currentSubjectHash = '';
let currentQuizData = null;
let submitted = false;

// ── DOM refs ───────────────────────────────────
const viewHome    = document.getElementById('view-home');
const viewSubject = document.getElementById('view-subject');
const viewQuiz    = document.getElementById('view-quiz');
const views       = [viewHome, viewSubject, viewQuiz];

const subjectsGrid     = document.getElementById('subjects-grid');
const weeksList        = document.getElementById('weeks-list');
const subjectIcon      = document.getElementById('subject-icon');
const subjectTitle     = document.getElementById('subject-title');
const questionsContainer = document.getElementById('questions-container');
const quizTitle        = document.getElementById('quiz-title');
const quizSubtitle     = document.getElementById('quiz-subtitle');
const quizProgressText = document.getElementById('quiz-progress-text');
const scoreBanner      = document.getElementById('score-banner');
const scoreValue       = document.getElementById('score-value');
const scoreTotal       = document.getElementById('score-total');
const scoreMsg         = document.getElementById('score-msg');
const scoreDetail      = document.getElementById('score-detail');
const quizForm         = document.getElementById('quiz-form');
const btnSubmit        = document.getElementById('btn-submit');
const breadcrumb       = document.getElementById('breadcrumb');

// ── Routing ────────────────────────────────────
function showView(id) {
  views.forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function router() {
  const hash = location.hash || '#home';

  if (hash === '#home' || hash === '#' || hash === '') {
    await renderHome();
    showView('view-home');
    setBreadcrumb([]);
  } else if (hash.startsWith('#subject/')) {
    const subjectId = hash.replace('#subject/', '');
    await renderSubject(subjectId);
    showView('view-subject');
  } else if (hash.startsWith('#quiz/')) {
    const parts = hash.replace('#quiz/', '').split('/');
    const subjectId = parts[0];
    const weekFile = parts.slice(1).join('/') + '.json';
    await renderQuiz(subjectId, weekFile);
    showView('view-quiz');
  } else {
    location.hash = '#home';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// ── Data Loading ───────────────────────────────
async function loadSubjects() {
  if (subjects.length) return subjects;
  const res = await fetch('quizzes/index.json');
  subjects = await res.json();
  return subjects;
}

async function loadQuiz(file) {
  const res = await fetch('quizzes/' + file);
  return res.json();
}

// ── Home View ──────────────────────────────────
async function renderHome() {
  const subs = await loadSubjects();
  subjectsGrid.innerHTML = subs.map(s => `
    <a class="subject-card" href="#subject/${s.id}" style="--card-color: ${s.color}">
      <div class="card-icon">${s.icon}</div>
      <div class="card-title">${s.title}</div>
      <div class="card-detail">${s.weeks.length} week${s.weeks.length > 1 ? 's' : ''} available</div>
      <span class="card-arrow">→</span>
    </a>
  `).join('');
}

// ── Subject / Weeks View ───────────────────────
async function renderSubject(subjectId) {
  const subs = await loadSubjects();
  const sub = subs.find(s => s.id === subjectId);
  if (!sub) { location.hash = '#home'; return; }

  currentSubjectId = subjectId;
  currentSubjectHash = '#subject/' + subjectId;

  subjectIcon.textContent = sub.icon;
  subjectTitle.textContent = sub.title;

  setBreadcrumb([
    { label: 'Home', href: '#home' },
    { label: sub.title, current: true }
  ]);

  weeksList.innerHTML = sub.weeks.map(w => {
    // Derive quiz hash from file path: remove .json extension
    const quizPath = w.file.replace(/\.json$/, '');
    return `
      <a class="week-card" href="#quiz/${subjectId}/${quizPath}">
        <div class="week-num">${w.week}</div>
        <div class="week-info">
          <span class="week-label">Week ${w.week}</span>
          <span class="week-questions">${w.title}</span>
        </div>
      </a>
    `;
  }).join('');
}

// ── Quiz View ──────────────────────────────────
async function renderQuiz(subjectId, weekFile) {
  const subs = await loadSubjects();
  const sub = subs.find(s => s.id === subjectId);
  if (!sub) { location.hash = '#home'; return; }

  currentSubjectId = subjectId;
  currentSubjectHash = '#subject/' + subjectId;
  submitted = false;

  // Find the week entry
  const weekEntry = sub.weeks.find(w => w.file === weekFile);
  const weekNum = weekEntry ? weekEntry.week : '?';

  const data = await loadQuiz(weekFile);
  currentQuizData = data;

  quizTitle.textContent = `Week ${weekNum} Quiz`;
  quizSubtitle.textContent = data.subject || sub.title;
  quizProgressText.textContent = `${data.questions.length} Questions`;

  setBreadcrumb([
    { label: 'Home', href: '#home' },
    { label: sub.title, href: '#subject/' + subjectId },
    { label: `Week ${weekNum}`, current: true }
  ]);

  // Reset
  scoreBanner.classList.add('hidden');
  quizForm.classList.remove('submitted');
  btnSubmit.style.display = '';

  questionsContainer.innerHTML = data.questions.map((q, i) => `
    <div class="question-block" id="qblock-${i}">
      <div class="question-text">
        <span class="q-number">Q${i + 1}.</span>
        <span>${escapeHTML(q.question)}</span>
      </div>
      <ul class="options-list">
        ${q.options.map((opt, j) => `
          <li>
            <label class="option-label" id="opt-${i}-${j}">
              <input type="radio" name="q${i}" value="${j}">
              <span class="option-radio"></span>
              <span class="option-text">${escapeHTML(opt)}</span>
            </label>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

// ── Submit & Grade ─────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  if (submitted) return false;

  const data = currentQuizData;
  if (!data) return false;

  let score = 0;
  let unanswered = 0;

  data.questions.forEach((q, i) => {
    const selected = quizForm.querySelector(`input[name="q${i}"]:checked`);
    const block = document.getElementById(`qblock-${i}`);
    const correctIdx = q.answer;

    // Mark correct option
    const correctLabel = document.getElementById(`opt-${i}-${correctIdx}`);
    correctLabel.classList.add('is-correct');
    const correctTag = document.createElement('span');
    correctTag.className = 'answer-tag correct';
    correctTag.textContent = '✓ Correct';
    correctLabel.appendChild(correctTag);

    if (selected) {
      const selectedIdx = parseInt(selected.value);
      if (selectedIdx === correctIdx) {
        score++;
        block.classList.add('correct');
      } else {
        block.classList.add('wrong');
        const wrongLabel = document.getElementById(`opt-${i}-${selectedIdx}`);
        wrongLabel.classList.add('is-wrong');
        const wrongTag = document.createElement('span');
        wrongTag.className = 'answer-tag wrong';
        wrongTag.textContent = '✗ Your answer';
        wrongLabel.appendChild(wrongTag);
      }
    } else {
      unanswered++;
      block.classList.add('wrong');
    }
  });

  // Show score banner
  scoreValue.textContent = score;
  scoreTotal.textContent = data.questions.length;

  const pct = Math.round((score / data.questions.length) * 100);
  if (pct >= 80) scoreMsg.textContent = '🎉 Excellent!';
  else if (pct >= 60) scoreMsg.textContent = '👍 Good job!';
  else if (pct >= 40) scoreMsg.textContent = '📖 Keep studying!';
  else scoreMsg.textContent = '💪 Don\'t give up!';

  let detail = `You scored ${score} out of ${data.questions.length} (${pct}%)`;
  if (unanswered > 0) detail += ` · ${unanswered} unanswered`;
  scoreDetail.textContent = detail;

  scoreBanner.classList.remove('hidden');
  quizForm.classList.add('submitted');
  btnSubmit.style.display = 'none';
  submitted = true;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}

// ── Retake ─────────────────────────────────────
function retakeQuiz() {
  // Re-trigger the current route to re-render the quiz
  const hash = location.hash;
  // Force re-render
  router();
}

// ── Breadcrumb ─────────────────────────────────
function setBreadcrumb(items) {
  if (!items.length) {
    breadcrumb.innerHTML = '';
    return;
  }
  breadcrumb.innerHTML = items.map((item, i) => {
    if (item.current) {
      return `<span class="current">${escapeHTML(item.label)}</span>`;
    }
    const sep = i > 0 ? '<span class="sep">›</span>' : '';
    return `${sep}<a href="${item.href}">${escapeHTML(item.label)}</a>`;
  }).join('<span class="sep">›</span>');
}

// ── Mobile Nav Drawer ──────────────────────────
const menuToggle       = document.getElementById('menu-toggle');
const menuClose        = document.getElementById('menu-close');
const navDrawer        = document.getElementById('nav-drawer');
const navOverlay       = document.getElementById('nav-overlay');
const drawerList       = document.getElementById('drawer-subjects-list');

function openDrawer() {
  navDrawer.classList.add('open');
  navOverlay.classList.add('visible');
  menuToggle.classList.add('open');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeDrawer() {
  navDrawer.classList.remove('open');
  navOverlay.classList.remove('visible');
  menuToggle.classList.remove('open');
  document.body.style.overflow = '';
}

menuToggle.addEventListener('click', openDrawer);
menuClose.addEventListener('click', closeDrawer);
navOverlay.addEventListener('click', closeDrawer);

// Helper to populate drawer once subjects are loaded
function populateDrawer(subs) {
  if (drawerList.hasChildNodes()) return; // Already populated
  
  drawerList.innerHTML = subs.map(s => `
    <li>
      <a href="#subject/${s.id}" onclick="closeDrawer()">
        <span class="icon">${s.icon}</span>
        <span class="text">${escapeHTML(s.title)}</span>
      </a>
    </li>
  `).join('');
}

// Hook into loadSubjects to populate drawer
const originalLoadSubjects = loadSubjects;
loadSubjects = async function() {
  const subs = await originalLoadSubjects();
  populateDrawer(subs);
  return subs;
};

// ── Utilities ──────────────────────────────────
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
