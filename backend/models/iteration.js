const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Iteration = sequelize.define('Iteration', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'Название итерации обязательно' },
        notEmpty: { msg: 'Название не может быть пустым' },
        len: { args: [1, 100], msg: 'Название должно быть от 1 до 100 символов' },
      },
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notNull: { msg: 'Тип итерации обязателен' },
        isIn: { args: [['sprint', 'phase']], msg: 'Тип должен быть sprint или phase' },
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isAfterStart(value) {
          if (value && this.start_date && new Date(value) < new Date(this.start_date)) {
            throw new Error('Дата окончания не может быть раньше даты начала');
          }
        },
      },
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notNull: { msg: 'Статус итерации обязателен' },
        isIn: { args: [['planned', 'active', 'completed']], msg: 'Статус должен быть planned, active или completed' },
      },
    },
  }, {
    tableName: 'iterations',
    timestamps: false,
  });

  return Iteration;
};