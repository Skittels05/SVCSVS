const express = require('express');
const path = require('path');
const { processData } = require('./parser');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../client')));

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.post('/api/parse', async (req, res) => {
  try {
    const data = await processData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при парсинге' });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'data.json');
    const raw = await require('fs').promises.readFile(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Данные ещё не собраны' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен → http://localhost:${PORT}`);
  console.log('Для запуска парсинга нажмите кнопку на главной странице');
});