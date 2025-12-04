const ecoleRepository = require('../repositories/ecole.repository');
const AppError = require('../utils/AppError');

class EcoleService {
  async create(data) {
    return ecoleRepository.create(data);
  }

  async findAll() {
    return ecoleRepository.findAll();
  }

  async findOne(id) {
    const ecole = await ecoleRepository.findById(id);
    if (!ecole) {
      throw AppError.notFound('École non trouvée.', 'ECOLE_NOT_FOUND');
    }
    return ecole;
  }

  async update(id, data) {
    const updatedEcole = await ecoleRepository.update(id, data);
    if (!updatedEcole) {
      throw AppError.notFound('École non trouvée.', 'ECOLE_NOT_FOUND');
    }
    return updatedEcole;
  }

  async delete(id) {
    const result = await ecoleRepository.delete(id);
    if (result === 0) {
      throw AppError.notFound('École non trouvée.', 'ECOLE_NOT_FOUND');
    }
    return { message: 'École supprimée avec succès.' };
  }
}

module.exports = new EcoleService();