// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR HANDLER] Полная ошибка:', err);

  let status = 500;
  let message = 'Внутренняя ошибка сервера';
  let details = null;

  // 1. Duplicate key error (E11000)
  if (err.code === 11000) {
    status = 409;
    message = 'Такая запись уже существует';
    details = {
      duplicateField: Object.keys(err.keyValue)[0],
      duplicateValue: Object.values(err.keyValue)[0]
    };
  }

  // 2. Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Ошибка проверки данных';
    details = {};
    Object.keys(err.errors).forEach(key => {
      details[key] = err.errors[key].message;
    });
  }

  // 3. CastError (неверный формат id)
  else if (err.name === 'CastError') {
    status = 400;
    message = `Неверный формат поля "${err.path}"`;
    details = { field: err.path, value: err.value };
  }

  // 4. Ошибки, которые ты сам кидаешь с .status
  else if (err.status) {
    status = err.status;
    message = err.message || 'Произошла ошибка';
  }

  // 5. Multer ошибки (загрузка файлов)
  else if (err instanceof require('multer').MulterError) {
    status = 400;
    message = `Ошибка загрузки файла: ${err.message}`;
  }

  // Отправляем ответ фронтенду
  res.status(status).json({
    status: 'error',
    message,
    details,  // ← это главное для фронта
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;