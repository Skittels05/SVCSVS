const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoRandomString = require('crypto-random-string');
const { User, UserPassword, RefreshToken, RecoveryToken } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const RECOVERY_EXPIRES_IN = '1h';

exports.register = async (req, res, next) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    const error = new Error('Все поля обязательны');
    error.status = 400;
    return next(error);
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('Пользователь с таким email уже существует');
      error.status = 409;
      return next(error);
    }

    const user = await User.create({ full_name, email });

    const passwordHash = await bcrypt.hash(password, 10);
    await UserPassword.create({ user_id: user.id, password_hash });

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user_id: user.id });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Email и пароль обязательны');
    error.status = 400;
    return next(error);
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Неверный email или пароль');
      error.status = 401;
      return next(error);
    }

    const userPassword = await UserPassword.findOne({ where: { user_id: user.id } });
    if (!userPassword) {
      const error = new Error('Пользователь не имеет пароля');
      error.status = 401;
      return next(error);
    }

    const isValid = await bcrypt.compare(password, userPassword.password_hash);
    if (!isValid) {
      const error = new Error('Неверный email или пароль');
      error.status = 401;
      return next(error);
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = cryptoRandomString({ length: 64 });

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  const { refresh_token } = req.body;

  if (refresh_token) {
    await RefreshToken.destroy({ where: { token: refresh_token } });
  }

  res.json({ message: 'Выход выполнен' });
};

exports.refresh = async (req, res, next) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    const error = new Error('Refresh token обязателен');
    error.status = 400;
    return next(error);
  }

  try {
    const tokenRecord = await RefreshToken.findOne({ where: { token: refresh_token } });
    if (!tokenRecord || new Date() > tokenRecord.expires_at) {
      const error = new Error('Недействительный или истёкший refresh token');
      error.status = 401;
      return next(error);
    }

    const user = await User.findByPk(tokenRecord.user_id);
    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      return next(error);
    }

    const newAccessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ access_token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'Если email зарегистрирован, на него отправлена ссылка для восстановления' });
    }

    const token = cryptoRandomString({ length: 64 });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await RecoveryToken.create({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    console.log(`Ссылка для восстановления: http://localhost:3000/recovery?token=${token}`);

    res.json({ message: 'Если email зарегистрирован, на него отправлена ссылка для восстановления' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    const error = new Error('Токен и новый пароль обязательны');
    error.status = 400;
    return next(error);
  }

  try {
    const recovery = await RecoveryToken.findOne({ where: { token, used: false } });
    if (!recovery || new Date() > recovery.expires_at) {
      const error = new Error('Недействительный или истёкший токен');
      error.status = 400;
      return next(error);
    }

    const userPassword = await UserPassword.findOne({ where: { user_id: recovery.user_id } });
    if (!userPassword) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      return next(error);
    }

    userPassword.password_hash = await bcrypt.hash(new_password, 10);
    await userPassword.save();

    recovery.used = true;
    await recovery.save();

    await RefreshToken.destroy({ where: { user_id: recovery.user_id } });

    res.json({ message: 'Пароль успешно изменён' });
  } catch (err) {
    next(err);
  }
};