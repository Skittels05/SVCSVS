const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { processData } = require('./parser');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

let cachedData = null;

async function loadData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'data.json');
    const raw = await fs.readFile(dataPath, 'utf-8');
    cachedData = JSON.parse(raw);
    return cachedData;
  } catch (err) {
    console.error('Не удалось загрузить data.json:', err.message);
    return null;
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.post('/api/parse', async (req, res) => {
  try {
    const data = await processData();
    cachedData = data;
    res.json({ success: true, message: 'Данные успешно обновлены' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при парсинге' });
  }
});

app.get('/api/quotes', async (req, res) => {
  if (!cachedData) {
    cachedData = await loadData();
  }

  if (!cachedData || !cachedData.quotes) {
    return res.status(404).json({ error: 'Данные ещё не собраны. Запустите парсинг.' });
  }

  let quotes = [...cachedData.quotes];

  if (req.query.category) {
    quotes = quotes.filter(q => q.category === req.query.category);
  }

  if (req.query.author) {
    const val = req.query.author.toLowerCase().trim();
    quotes = quotes.filter(q => q.author.toLowerCase().includes(val));
  }

  if (req.query.tag) {
    const val = req.query.tag.toLowerCase().trim();
    quotes = quotes.filter(q => q.tags.some(t => t.toLowerCase().includes(val)));
  }

  if (req.query.search) {
    const val = req.query.search.toLowerCase().trim();
    quotes = quotes.filter(q => q.text.toLowerCase().includes(val));
  }

  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;

  const total = quotes.length;
  const start = (page - 1) * limit;
  const paginatedQuotes = quotes.slice(start, start + limit);

  const totalPages = Math.ceil(total / limit);

  res.json({
    quotes: paginatedQuotes,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    stats: cachedData.stats
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен → http://localhost:${PORT}`);
  console.log('Для запуска парсинга нажмите кнопку на главной странице');
});