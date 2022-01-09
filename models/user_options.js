'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_options.init({
    userId: DataTypes.INTEGER,
    optionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_options',
  });
  return user_options;
};