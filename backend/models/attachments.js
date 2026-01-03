const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: 'Имя файла обязательно' },
        notEmpty: { msg: 'Имя файла не может быть пустым' },
        len: { args: [1, 255], msg: 'Имя файла должно быть от 1 до 255 символов' },
      },
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notNull: { msg: 'Путь к файлу обязателен' },
        notEmpty: { msg: 'Путь к файлу не может быть пустым' },
        len: { args: [1, 500], msg: 'Путь к файлу должен быть до 500 символов' }
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'attachments',
    timestamps: false,
  });

  return Attachment;
};