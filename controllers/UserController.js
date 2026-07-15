const BaseController = require('./BaseController');
const { UserService } = require('../services');

class UserController extends BaseController {
  constructor(db) {
    const userService = new UserService(db);
    super(userService);
    this.userService = userService;
  }

  async findByEmail(req, res, next) {
    try {
      const user = await this.userService.findByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;