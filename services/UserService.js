const BaseService = require('./BaseService');
const { User } = require('../models');

class UserService extends BaseService {
  constructor(db) {
    const userModel = new User(db);
    super(userModel);
    this.userModel = userModel;
  }

  async findByEmail(email) {
    return this.userModel.findByEmail(email);
  }

  async createUser(userData) {
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new Error('Email already exists');
    }
    return this.userModel.create(userData);
  }
}

module.exports = UserService;