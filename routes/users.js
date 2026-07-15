const express = require('express');
const router = express.Router();

const createUserRoutes = (db) => {
  const { User } = db;

  router.get('/', async (req, res, next) => {
    try {
      const users = await User.findAll({ attributes: ['id', 'name', 'email', 'active', 'created_at'] });
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, { attributes: ['id', 'name', 'email', 'active', 'created_at'] });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  });

  router.get('/email/:email', async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { email: req.params.email } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const user = await User.create({ name, email, password });
      res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      await user.update(req.body);
      res.json({ success: true, data: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      await user.destroy();
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = createUserRoutes;