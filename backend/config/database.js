// config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB успешно подключена'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Опционально: обработка событий подключения
mongoose.connection.on('connected', () => {
  console.log('Mongoose успешно подключён к БД');
});

mongoose.connection.on('error', (err) => {
  console.error('Ошибка Mongoose соединения:', err);
});