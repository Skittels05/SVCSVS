const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: 'Имя файла обязательно' },
        notEmpty: { msg: 'Имя файла не может быть пустым' },
        len: { args: [1, 255], msg: 'Имя файла до 255 символов' },
      },
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notNull: { msg: 'URL файла обязателен' },
        isUrl: { msg: 'Некорректный URL файла' },
        len: { args: [1, 500], msg: 'URL должен быть до 500 символов' },
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'Attachments',
    timestamps: false,
  });

  return Attachment;
};