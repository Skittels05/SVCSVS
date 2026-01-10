export const handleApiError = (resultAction, setFormErrors, setServerError = () => {}) => {
  setFormErrors({});
  setServerError('');

  const err = resultAction.payload || resultAction.error || resultAction;

  console.log('[handleApiError] Полная ошибка:', err);

  const data = err?.response?.data || err?.data || err;

  if (data && data.message) {

    setServerError(data.message);

    if (data.details) {
      const fieldErrors = {};

      if (typeof data.details === 'object' && !Array.isArray(data.details)) {
        Object.keys(data.details).forEach(key => {
          fieldErrors[key] = data.details[key];
        });
      }
      else if (Array.isArray(data.details)) {
        data.details.forEach(e => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
      }

      setFormErrors(fieldErrors);
    }
  } else {
    setServerError('Неизвестная ошибка сервера. Попробуйте позже.');
  }

  console.error('API Error обработана:', data);
};