const errorHandler = (err, req, res, next) => {

  let status = 500;
  let response = {
    status: 'error',
    message: 'Внутренняя ошибка сервера',
  };

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));

    response = {
      status: 'error',
      message: 'Ошибка валидации данных',
      errors
    };
  }

  else if (err instanceof require('multer').MulterError) {
    status = 400;
    response = {
      status: 'error',
      message: `Ошибка загрузки файла: ${err.message}`
    };
  }

  else if (err.status || err.statusCode) {
    status = err.status || err.statusCode;
    response = {
      status: 'error',
      message: err.message || 'Ошибка'
    };
  }

  res.status(status).json(response);
};

module.exports = errorHandler;