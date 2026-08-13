const BaseRepository = require('../repositories/baseRepository');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const createCrudController = (Model) => {
  const repository = new BaseRepository(Model);
  return {
    list: asyncHandler(async (req, res) => {
      const data = await repository.findAll(req.query.filter ? JSON.parse(req.query.filter) : {});
      res.json({ success: true, data });
    }),
    get: asyncHandler(async (req, res) => {
      const data = await repository.findById(req.params.id);
      if (!data) throw new AppError('Resource not found', 404);
      res.json({ success: true, data });
    }),
    create: asyncHandler(async (req, res) => {
      const data = await repository.create(req.body);
      res.status(201).json({ success: true, data });
    }),
    update: asyncHandler(async (req, res) => {
      const data = await repository.update(req.params.id, req.body);
      if (!data) throw new AppError('Resource not found', 404);
      res.json({ success: true, data });
    }),
    remove: asyncHandler(async (req, res) => {
      await repository.softDelete(req.params.id);
      res.json({ success: true });
    }),
  };
};

module.exports = createCrudController;
