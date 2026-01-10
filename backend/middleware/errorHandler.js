// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Для отладки — всегда полезно видеть полную ошибку в консоли
  console.error('Ошибка сервера:', err);
  console.error('Stack trace:', err.stack);

  let status = 500;
  let response = {
    status: 'error',
    message: 'Внутренняя ошибка сервера',
  };

  // Ошибки валидации Mongoose
  if (err.name === 'ValidationError') {
    status = 400;
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));

    response = {
      status: 'error',
      message: 'Ошибка валидации данных',
      errors,
    };
  }

  // Нарушение уникальности (duplicate key)
  else if (err.code === 11000) {
    status = 409; // Conflict
    response = {
      status: 'error',
      message: 'Запись с такими данными уже существует',
      field: Object.keys(err.keyValue)[0] || 'unknown',
    };
  }

  // CastError — например, неверный формат ObjectId
  else if (err.name === 'CastError') {
    status = 400;
    response = {
      status: 'error',
      message: `Некорректный формат ID: ${err.value}`,
    };
  }

  // Multer ошибки (загрузка файлов)
  else if (err instanceof require('multer').MulterError) {
    status = 400;
    response = {
      status: 'error',
      message: `Ошибка загрузки файла: ${err.message}`,
    };
  }

  // Ошибки, которые мы сами кидаем (с .status)
  else if (err.status || err.statusCode) {
    status = err.status || err.statusCode;
    response = {
      status: 'error',
      message: err.message || 'Произошла ошибка',
    };
  }

  // Всё остальное — 500
  res.status(status).json(response);
};

module.exports = errorHandler;