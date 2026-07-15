'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [{
      name: 'Admin User',
      email: 'admin@taiksu.com',
      password: '$2a$10$YourHashedPasswordHere',
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};