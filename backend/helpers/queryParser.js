exports.parseQuery = (query) => {
  const { page = 1, limit = 10, sort, search, searchFields, include } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitInt = parseInt(limit);

  let mongoSort = { _id: 1 }; // По умолчанию ASC по id
  if (sort) {
    const [field, direction = 'asc'] = sort.split(':');
    const dir = direction.toLowerCase() === 'desc' ? -1 : 1;
    mongoSort = { [field]: dir };
  }

  let where = {};
  let populate = [];

  Object.keys(query).forEach((key) => {
    if (!['page', 'limit', 'sort', 'search', 'searchFields', 'include'].includes(key)) {
      where[key] = query[key];
    }
  });

  if (search && searchFields) {
    const fields = searchFields.split(',');
    where.$or = fields.map((field) => ({
      [field]: { $regex: search, $options: 'i' },
    }));
  }

  if (include) {
    const modelsToInclude = include.split(',');
    modelsToInclude.forEach((modelName) => {
      if (modelName === 'Attachments') {
        populate.push({ path: 'attachments', select: 'id file_name file_url' });
      }
    });
  }

  return { where, sort: mongoSort, limit: limitInt, skip, populate };
};