const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'rights'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    req.user = {
      id: user.id,
      rights: user.rights,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

module.exports = verifyToken;