const { Op } = require('sequelize');

exports.parseQuery = (query) => {
  const { page = 1, limit = 10, sort, search, searchFields, include } = query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitInt = parseInt(limit);

  let order = [['id', 'ASC']];
  if (sort) {
    const [field, direction = 'ASC'] = sort.split(':');
    const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    order = [[field, dir]];
  }

  let where = {};
  let includeModels = [];

  Object.keys(query).forEach((key) => {
    if (!['page', 'limit', 'sort', 'search', 'searchFields', 'include'].includes(key)) {
      where[key] = query[key];
    }
  });

  if (search && searchFields) {
    const fields = searchFields.split(',');
    where[Op.or] = fields.map((field) => ({
      [field]: { [Op.iLike]: `%${search}%` },
    }));
  }

  if (include) {
    const modelsToInclude = include.split(',');
    modelsToInclude.forEach((modelName) => {

      if (modelName === 'Attachments') {
        includeModels.push({
          model: require('../models').Attachment,
          attributes: ['id', 'file_name', 'file_url'],
        });
      }
    });
  }

  return { where, order, limit: limitInt, offset, include: includeModels };
};