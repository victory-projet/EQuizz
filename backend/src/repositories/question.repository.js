// backend/src/repositories/question.repository.js

const db = require('../models');

class QuestionRepository {
  async create(data) {
    return db.Question.create(data);
  }

  async findById(id) {
    return db.Question.findByPk(id);
  }

  async update(id, data) {
    const question = await this.findById(id);
    if (question) {
      return question.update(data);
    }
    return null;
  }

  async delete(id) {
    return db.Question.destroy({
      where: { id: id }
    });
  }
}

module.exports = new QuestionRepository();