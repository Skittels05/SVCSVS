export const handleApiError = (resultAction, setFormErrors, setServerError = () => {}) => {
  setFormErrors({});
  setServerError('');

  const err = resultAction.payload || resultAction.error;

  if (err && err.response && err.response.data) {
    const data = err.response.data;

    if (data.errors && Array.isArray(data.errors)) {
      const fieldErrors = {};
      data.errors.forEach((e) => {
        if (e.field) {
          fieldErrors[e.field] = e.message;
        }
      });
      setFormErrors(fieldErrors);

      if (data.message && Object.keys(fieldErrors).length === 0) {
        setServerError(data.message);
      }
    } else if (data.message) {
      setServerError(data.message);
    }
  } else {

    setServerError('Ошибка соединения с сервером. Проверьте, запущен ли бэкенд.');
  }
};