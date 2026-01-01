const { Op } = require('sequelize');

exports.parseQuery = (query) => {
  const { page = 1, limit = 10, sort, search, searchFields } = query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitInt = parseInt(limit);

  let order = [['id', 'ASC']];
  if (sort) {
    const [field, direction] = sort.split(':');
    order = [[field, direction.toUpperCase() || 'ASC']];
  }

  let where = {};

  Object.keys(query).forEach(key => {
    if (!['page', 'limit', 'sort', 'search', 'searchFields'].includes(key)) {
      where[key] = query[key];
    }
  });

  if (search && searchFields) {
    const fields = searchFields.split(',');
    where[Op.or] = fields.map(field => ({
      [field]: { [Op.iLike]: `%${search}%` }
    }));
  }

  return { where, order, limit: limitInt, offset };
};