require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./models');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/project-members', require('./routes/projectMemberRoutes'));
app.use('/api/iterations', require('./routes/iterationRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/attachments', require('./routes/attachmentRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'API системы управления проектами работает!' });
});

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

db.sequelize
  .sync({ alter: false })
  .then(() => {
    console.log('База данных успешно подключена и синхронизирована');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к БД:', err);
  });