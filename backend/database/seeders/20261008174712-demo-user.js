'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example: 
     * */

      await queryInterface.bulkInsert('People', [{
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
      }], {});
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example: */
      await queryInterface.bulkDelete('User', null, {});
     
  }
};
