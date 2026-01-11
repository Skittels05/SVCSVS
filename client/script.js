const parseBtn = document.getElementById('parseBtn');
const loader = document.getElementById('loader');
const quotesGrid = document.getElementById('quotes');
const statsDiv = document.getElementById('stats');
const countSpan = document.getElementById('count');
const categoryFilter = document.getElementById('categoryFilter');
const authorFilter = document.getElementById('authorFilter');
const tagFilter = document.getElementById('tagFilter');
const searchInput = document.getElementById('search');

let allData = null;
let pieChart = null;
let barChart = null;

parseBtn.addEventListener('click', async () => {
  loader.classList.remove('hidden');
  parseBtn.disabled = true;

  try {
    const res = await fetch('/api/parse', { method: 'POST' });
    if (!res.ok) throw new Error('Ошибка сервера');
    allData = await res.json();
    renderAll();
  } catch (err) {
    console.error(err);
    alert('Не удалось выполнить парсинг. Попробуйте позже.');
  } finally {
    loader.classList.add('hidden');
    parseBtn.disabled = false;
  }
});

async function loadExistingData() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      allData = await res.json();
      renderAll();
    }
  } catch (e) {
  }
}

function renderAll() {
  if (!allData) return;

  renderQuotes();
  renderStats();
  renderCharts();
}

function renderQuotes() {
  quotesGrid.innerHTML = '';
  let filtered = [...allData.quotes];

  const cat = categoryFilter.value;
  if (cat) filtered = filtered.filter(q => q.category === cat);

  const authorVal = authorFilter.value.toLowerCase().trim();
  if (authorVal) filtered = filtered.filter(q => q.author.toLowerCase().includes(authorVal));

  const tagVal = tagFilter.value.toLowerCase().trim();
  if (tagVal) filtered = filtered.filter(q => q.tags.some(t => t.toLowerCase().includes(tagVal)));

  const searchVal = searchInput.value.toLowerCase().trim();
  if (searchVal) filtered = filtered.filter(q => q.text.toLowerCase().includes(searchVal));

  countSpan.textContent = filtered.length;

  filtered.forEach(q => {
    const card = document.createElement('div');
    card.className = 'quote-card';

    const categoryClass = q.category === 'love' ? 'love' :
                         q.category === 'life' ? 'life' : 'both';

    card.innerHTML = `
      <div class="quote-text">"${q.text}"</div>
      <div class="author">${q.author}</div>
      <div class="tags">Теги: ${q.tags.join(', ')}</div>
      <div class="category ${categoryClass}">Категория: ${q.category}</div>
    `;

    quotesGrid.appendChild(card);
  });
}

function renderStats() {
  const s = allData.stats;

  statsDiv.innerHTML = `
    <strong>Статистика:</strong><br>
    Только love: ${s.onlyLove}<br>
    Только life: ${s.onlyLife}<br>
    Оба тега: ${s.both}<br>
    Всего цитат: ${s.total}<br><br>

    <strong>Топ-5 авторов:</strong><br>
    • Love: ${s.topAuthorsLove.map(a => `${a.author} (${a.count})`).join(', ') || '—'}<br>
    • Life: ${s.topAuthorsLife.map(a => `${a.author} (${a.count})`).join(', ') || '—'}<br>
    • Оба: ${s.topAuthorsBoth.map(a => `${a.author} (${a.count})`).join(', ') || '—'}<br><br>

    <strong>Популярные сопутствующие теги:</strong><br>
    Love: ${s.tagCloudLove.map(([t,c]) => `${t} (${c})`).join(', ') || '—'}<br>
    Life: ${s.tagCloudLife.map(([t,c]) => `${t} (${c})`).join(', ') || '—'}
  `;

  document.getElementById('venn').innerHTML = `
    <strong>Пересечение тегов (Венн):</strong><br>
    <div style="font-size:1.4rem; margin:1rem 0;">
      Love: ${s.onlyLove} 　✖　 <span style="color:#8e44ad;font-weight:bold">${s.both}</span> 　✖　 Life: ${s.onlyLife}
    </div>
  `;
}

function renderCharts() {
  const s = allData.stats;

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: ['Только love', 'Только life', 'Оба'],
      datasets: [{
        data: [s.onlyLove, s.onlyLife, s.both],
        backgroundColor: ['#e74c3c', '#3498db', '#8e44ad'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  if (barChart) barChart.destroy();

  const allTopAuthors = [...s.topAuthorsLove, ...s.topAuthorsLife, ...s.topAuthorsBoth]
    .map(a => a.author);
  const uniqueAuthors = [...new Set(allTopAuthors)].slice(0, 8);

  const loveData = uniqueAuthors.map(name =>
    s.topAuthorsLove.find(a => a.author === name)?.count || 0);
  const lifeData = uniqueAuthors.map(name =>
    s.topAuthorsLife.find(a => a.author === name)?.count || 0);
  const bothData = uniqueAuthors.map(name =>
    s.topAuthorsBoth.find(a => a.author === name)?.count || 0);

  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: uniqueAuthors,
      datasets: [
        { label: 'Love', data: loveData, backgroundColor: '#e74c3c' },
        { label: 'Life', data: lifeData, backgroundColor: '#3498db' },
        { label: 'Оба',   data: bothData, backgroundColor: '#8e44ad' }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

[categoryFilter, authorFilter, tagFilter, searchInput].forEach(el => {
  el.addEventListener('input', renderQuotes);
});

loadExistingData();