exports.parseQuery = (query) => {
  let mongoSort = { _id: 1 };
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  if (query.sort) {
    const decodedSort = decodeURIComponent(query.sort);
    const parts = decodedSort.split(':');
    let field = parts[0]?.trim();
    const direction = (parts[1] || 'asc').toLowerCase().trim();

    if (field === 'id') field = '_id';

    if (field) {
      mongoSort = { [field]: direction === 'desc' ? -1 : 1 };
    }
  }

  const where = {};
  Object.keys(query).forEach((key) => {
    if (!['page', 'limit', 'sort', 'search', 'searchFields', 'include'].includes(key)) {
      where[key] = query[key];
    }
  });

  if (query.search && query.searchFields) {
    const fields = query.searchFields.split(',').map(f => f.trim());
    where.$or = fields.map(field => ({
      [field]: { $regex: query.search.trim(), $options: 'i' }
    }));
  }

  let populate = [];
  if (query.include) {
    const includes = query.include.split(',').map(i => i.trim());
    includes.forEach(model => {
      if (model === 'Attachments') {
        populate.push({ path: 'attachments', select: 'id file_name file_url' });
      }
    });
  }

  return {
    where,
    sort: mongoSort,
    limit,
    skip,
    populate,
    page
  };
};