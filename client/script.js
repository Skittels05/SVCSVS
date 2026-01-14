const parseBtn     = document.getElementById('parseBtn');
const loader       = document.getElementById('loader');
const quotesGrid   = document.getElementById('quotes');
const statsDiv     = document.getElementById('stats');
const countSpan    = document.getElementById('count');
const categoryFilter = document.getElementById('categoryFilter');
const authorFilter = document.getElementById('authorFilter');
const tagFilter    = document.getElementById('tagFilter');
const searchInput  = document.getElementById('search');
const limitSelect  = document.getElementById('limitSelect');
const prevBtn      = document.getElementById('prevPage');
const nextBtn      = document.getElementById('nextPage');
const pageInfo     = document.getElementById('pageInfo');
const vennDiv      = document.getElementById('venn');

let currentPage = 1;
let currentLimit = 20;
let totalPages = 1;
let pieChart = null;
let barChart = null;

async function fetchQuotes() {
  const params = new URLSearchParams({
    page: currentPage,
    limit: currentLimit
  });

  if (categoryFilter.value) params.append('category', categoryFilter.value);
  if (authorFilter.value.trim()) params.append('author', authorFilter.value.trim());
  if (tagFilter.value.trim()) params.append('tag', tagFilter.value.trim());
  if (searchInput.value.trim()) params.append('search', searchInput.value.trim());

  try {
    loader.classList.remove('hidden');
    const res = await fetch(`/api/quotes?${params}`);
    if (!res.ok) throw new Error('Ошибка сервера');
    const data = await res.json();

    renderQuotes(data.quotes);
    renderStats(data.stats);
    renderCharts(data.stats);
    updatePagination(data.pagination);
  } catch (err) {
    console.error(err);
    quotesGrid.innerHTML = '<p style="color:red">Не удалось загрузить цитаты</p>';
  } finally {
    loader.classList.add('hidden');
  }
}

function renderQuotes(quotes) {
  quotesGrid.innerHTML = '';
  countSpan.textContent = quotes.length;

  quotes.forEach(q => {
    const card = document.createElement('div');
    card.className = 'quote-card';

    const categoryClass = q.category === 'love' ? 'love' :
                         q.category === 'life' ? 'life' : 'both';

    card.innerHTML = `
      <div class="quote-text">"${q.text}"</div>
      <div class="author">${q.author}</div>
      <div class="tags">Теги: ${q.tags.join(', ')}</div>
      <div class="category ${categoryClass}">Категория: ${q.category || '—'}</div>
    `;

    quotesGrid.appendChild(card);
  });
}

function renderStats(s) {
  if (!s) {
    statsDiv.innerHTML = '<p>Статистика недоступна</p>';
    vennDiv.innerHTML = '';
    return;
  }

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

  vennDiv.innerHTML = `
    <strong>Пересечение тегов (Венн):</strong><br>
    <div style="font-size:1.4rem; margin:1rem 0;">
      Love: ${s.onlyLove} 　✖　 <span style="color:#8e44ad;font-weight:bold">${s.both}</span> 　✖　 Life: ${s.onlyLife}
    </div>
  `;
}

function renderCharts(s) {
  if (!s) return;

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
  const uniqueAuthors = [...new Set(allTopAuthors)].slice(0, 15);

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
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function updatePagination(p) {
  totalPages = p.totalPages;
  currentPage = p.currentPage;
  pageInfo.textContent = `Страница ${p.currentPage} из ${p.totalPages} (${p.total} цитат)`;

  prevBtn.disabled = !p.hasPrev;
  nextBtn.disabled = !p.hasNext;
}


function onFilterChange() {
  currentPage = 1;
  fetchQuotes();
}

[categoryFilter, authorFilter, tagFilter, searchInput, limitSelect].forEach(el => {
  el.addEventListener('change', onFilterChange);
  if (el.tagName === 'INPUT') el.addEventListener('input', onFilterChange);
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchQuotes();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchQuotes();
  }
});

parseBtn.addEventListener('click', async () => {
  loader.classList.remove('hidden');
  parseBtn.disabled = true;

  try {
    const res = await fetch('/api/parse', { method: 'POST' });
    if (!res.ok) throw new Error();
    alert('Парсинг завершён успешно!');
    currentPage = 1;
    fetchQuotes();
  } catch (err) {
    alert('Ошибка при парсинге');
  } finally {
    loader.classList.add('hidden');
    parseBtn.disabled = false;
  }
});

fetchQuotes();