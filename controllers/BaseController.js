class BaseController {
  constructor(service) {
    this.service = service;
  }

  async getAll(req, res, next) {
    try {
      const data = await this.service.getAll(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await this.service.getById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const data = await this.service.update(req.params.id, req.body);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const data = await this.service.delete(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BaseController;