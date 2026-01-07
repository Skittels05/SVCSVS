const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPassword = sequelize.define('UserPassword', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'user_passwords',
    timestamps: false,
  });

  return UserPassword;
};