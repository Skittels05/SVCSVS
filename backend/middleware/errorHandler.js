const errorHandler = (err, req, res, next) => {
  console.error('[ERROR HANDLER] Полная ошибка:', err);

  let status = 500;
  let message = 'Внутренняя ошибка сервера';
  let details = null;

  if (err.code === 11000) {
    status = 409;
    message = 'Такая запись уже существует';
    details = {
      duplicateField: Object.keys(err.keyValue)[0],
      duplicateValue: Object.values(err.keyValue)[0]
    };
  }

  else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Ошибка проверки данных';
    details = {};
    Object.keys(err.errors).forEach(key => {
      details[key] = err.errors[key].message;
    });
  }

  else if (err.name === 'CastError') {
    status = 400;
    message = `Неверный формат поля "${err.path}"`;
    details = { field: err.path, value: err.value };
  }

  else if (err.status) {
    status = err.status;
    message = err.message || 'Произошла ошибка';
  }

  else if (err instanceof require('multer').MulterError) {
    status = 400;
    message = `Ошибка загрузки файла: ${err.message}`;
  }

  res.status(status).json({
    status: 'error',
    message,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;