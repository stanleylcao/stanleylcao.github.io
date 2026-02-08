/* ========================================
   A Curious Critter — Main JavaScript
   ======================================== */

// ---- i18n Translations ----
var translations = {
  site_name:        { en: 'A Curious Critter',  zh: '好奇小兽' },
  nav_essays:       { en: 'Essays',             zh: '文章' },
  nav_quotes:       { en: 'Quotes',             zh: '语录' },
  lang_toggle:      { en: '中文',               zh: 'EN' },
  hero_title:       { en: 'A Curious Critter',  zh: '好奇小兽' },
  hero_bio:         { en: 'I used to do things. Now I do other things.',
                      zh: '从前做些事情。如今做些别的。' },
  home_essays_desc: { en: '— Thoughts, in several languages.',
                      zh: '— 用几种语言写下的思考。' },
  home_quotes_desc: { en: '— Words worth keeping, and some reflections.',
                      zh: '— 值得留存的话语，以及一些思索。' },
  essays_title:     { en: 'Essays',              zh: '文章' },
  quotes_title:     { en: 'Quotes & Reflections', zh: '语录与思索' },
  filter_all:       { en: 'All',                 zh: '全部' },
  reflection_label: { en: 'Reflection',          zh: '思索' },
  back_essays:      { en: '← Essays',           zh: '← 文章' }
};

// ---- Language State ----
var currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  document.documentElement.classList.remove('lang-en', 'lang-zh');
  document.documentElement.classList.add('lang-' + lang);

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (translations[key] && translations[key][lang]) {
      el.textContent = translations[key][lang];
    }
  });
}

function toggleLang() {
  applyLang(currentLang === 'en' ? 'zh' : 'en');
}

// ---- Date Formatting ----
// Uses Intl.DateTimeFormat so numbers and month names match the essay's language.
function formatDate(dateStr, lang) {
  if (!dateStr) return '';
  var date = new Date(dateStr + 'T00:00:00');
  var locale = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(date);
}

// ---- Essay List (essays.html) ----
// Dynamically loads the essay list from essays/manifest.json so that
// all essay metadata lives in the essay files themselves (via <meta> tags)
// and gets compiled into the manifest by build.py.

function loadEssayList() {
  var list = document.querySelector('.essay-list');
  if (!list) return; // not on the essays page

  fetch('essays/manifest.json')
    .then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(function (essays) {
      renderEssayList(essays, list);
    })
    .catch(function () {
      list.innerHTML =
        '<li class="essay-list-hint">No essays found. Run <code>python3 build.py</code> to generate the manifest.</li>';
    });
}

var langLabels = { en: 'English', zh: '中文', ja: '日本語' };

function renderEssayList(essays, list) {
  list.innerHTML = '';

  if (essays.length === 0) {
    list.innerHTML = '<li class="essay-list-hint">No essays yet.</li>';
    return;
  }

  essays.forEach(function (essay) {
    var li = document.createElement('li');
    li.className = 'essay-item';
    li.setAttribute('data-lang', essay.lang);
    li.setAttribute('lang', essay.lang);  // ensures correct font for title/date/numbers

    var date = formatDate(essay.published, essay.lang);
    var label = langLabels[essay.lang] || essay.lang;

    li.innerHTML =
      '<div class="essay-title"><a href="essays/' + essay.file + '">' + essay.title + '</a></div>' +
      '<div class="essay-meta">' + date + ' · ' + label + '</div>' +
      '<div class="essay-excerpt">' + essay.excerpt + '</div>';

    list.appendChild(li);
  });

  // Re-bind filter after dynamic render
  initEssayFilter();
}

// ---- Essay Date (individual essay pages) ----
// Reads the manifest to fill in the date for the current essay page,
// so the author never has to manage dates manually.

function loadEssayDate() {
  var dateEl = document.getElementById('essay-date');
  if (!dateEl) return; // not on an essay page

  fetch('manifest.json')
    .then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(function (essays) {
      var filename = window.location.pathname.split('/').pop();
      for (var i = 0; i < essays.length; i++) {
        if (essays[i].file === filename) {
          var essay = essays[i];
          var date = formatDate(essay.published, essay.lang);
          var label = langLabels[essay.lang] || essay.lang;
          dateEl.textContent = date + ' · ' + label;
          return;
        }
      }
    })
    .catch(function () {
      // Keep whatever fallback text is in the HTML
    });
}

// ---- Essay Language Filter ----
function initEssayFilter() {
  var filterButtons = document.querySelectorAll('.lang-filter button');
  var essayItems = document.querySelectorAll('.essay-item');

  if (!filterButtons.length) return;

  filterButtons.forEach(function (btn) {
    // Remove old listeners by cloning
    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', function () {
      var filter = newBtn.getAttribute('data-filter');

      document.querySelectorAll('.lang-filter button').forEach(function (b) {
        b.classList.remove('active');
      });
      newBtn.classList.add('active');

      essayItems.forEach(function (item) {
        var lang = item.getAttribute('data-lang');
        item.style.display = (filter === 'all' || lang === filter) ? '' : 'none';
      });
    });
  });
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', function () {
  applyLang(currentLang);
  loadEssayList();
  loadEssayDate();
});
