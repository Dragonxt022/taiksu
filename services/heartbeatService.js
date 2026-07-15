const { sequelize } = require('../models');

async function checkDatabase() {
    await sequelize.authenticate();
}

module.exports = { checkDatabase };
