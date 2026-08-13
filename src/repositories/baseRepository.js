class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findAll(filter = {}, options = {}) {
    return this.model.find({ deletedAt: null, ...filter }, null, options);
  }

  findById(id) {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  create(data) {
    return this.model.create(data);
  }

  update(id, data) {
    return this.model.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true });
  }

  softDelete(id) {
    return this.update(id, { deletedAt: new Date() });
  }
}

module.exports = BaseRepository;
