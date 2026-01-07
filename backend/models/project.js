const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'Название проекта обязательно' },
        notEmpty: { msg: 'Название проекта не может быть пустым' },
        len: { args: [1, 100], msg: 'Название должно быть от 1 до 100 символов' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    project_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notNull: { msg: 'Тип проекта обязателен' },
        isIn: { args: [['scrum', 'waterfall']], msg: 'Тип проекта должен быть scrum или waterfall' },
      },
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notNull: { msg: 'Статус проекта обязателен' },
        isIn: { args: [['planned', 'active', 'completed']], msg: 'Статус должен быть planned, active или completed' },
      },
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'projects',
    timestamps: false,
  });

  Project.addHook('beforeUpdate', (instance) => {
    instance.updated_at = new Date();
  });

  return Project;
};