"use strict";
const bcrypt = require("bcrypt");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Admin",
          email: "admin@shangrila.gov.un",
          address: "Admin Address",
          dob: "1900",
          password: bcrypt.hashSync("shangrila@2021$", bcrypt.genSaltSync(10)),
          sni: "1234567890908765",
          role: "admin",
          createdAt: "2021-01-09",
          updatedAt: "2023-01-09",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("users", null, {});
  },
};
