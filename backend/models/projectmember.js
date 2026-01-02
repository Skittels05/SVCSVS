const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectMember = sequelize.define('ProjectMember', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: 'Роль в проекте обязательна' },
        notEmpty: { msg: 'Роль не может быть пустой' },
        len: { args: [1, 50], msg: 'Роль должна быть от 1 до 50 символов' },
      },
    },
  }, {
    tableName: 'projectmembers',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['project_id', 'user_id'], name: 'unique_project_user' },
    ],
  });

  return ProjectMember;
};