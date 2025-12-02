const participationService = require('../services/participation.service');

class ParticipationController {
  
  /**
   * Récupère le taux de participation par jour de la semaine
   * @route GET /api/participation/taux-par-jour
   */
  async getParticipationRateByDay(req, res) {
    try {
      const participationRates = await participationService.calculateParticipationRateByDay();
      
      return res.status(200).json({
        success: true,
        data: participationRates,
        message: 'Taux de participation calculé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors du calcul du taux de participation par jour:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul du taux de participation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Récupère le taux de participation global
   * @route GET /api/participation/taux-global
   */
  async getGlobalParticipationRate(req, res) {
    try {
      const globalRate = await participationService.calculateGlobalParticipationRate();
      
      return res.status(200).json({
        success: true,
        data: globalRate,
        message: 'Taux de participation global calculé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors du calcul du taux de participation global:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul du taux de participation global',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ParticipationController();