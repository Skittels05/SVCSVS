const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'Полное имя обязательно' },
        notEmpty: { msg: 'Полное имя не может быть пустым' },
        len: { args: [1, 100], msg: 'Полное имя должно быть от 1 до 100 символов' },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Email уже используется' },
      validate: {
        notNull: { msg: 'Email обязателен' },
        isEmail: { msg: 'Некорректный формат email' },
        len: { args: [1, 100], msg: 'Email должен быть до 100 символов' },
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });

  return User;
};