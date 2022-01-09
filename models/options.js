"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ questions, user }) {
      // define association here
      this.belongsTo(questions, { foreignKey: "questionId" });
      options.belongsToMany(user, {
        foreignKey: "optionId",
        through: "user_options",
        as: "users",
      });
    }
    toJSON() {
      return {
        ...this.get(),
        createdAt: undefined,
        updatedAt: undefined,
      };
    }
  }
  options.init(
    {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "options",
    }
  );
  return options;
};
