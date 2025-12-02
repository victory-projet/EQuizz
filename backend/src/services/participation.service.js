const quizzRepository = require('../repositories/quizz.repository');
const etudiantRepository = require('../repositories/etudiant.repository');

class ParticipationService {
  
  /**
   * Calcule le taux de participation des étudiants par jour de la semaine
   * @returns {Promise<Array>}
   */
  async calculateParticipationRateByDay() {
    const daysOfWeek = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 
      'Jeudi', 'Vendredi', 'Samedi'
    ];

    const totalStudents = await etudiantRepository.countAll();
    const results = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const participatingStudents = await quizzRepository.countParticipantsByDay(dayIndex);
      
      const rate = totalStudents > 0 
        ? ((participatingStudents / totalStudents) * 100).toFixed(2)
        : 0;

      results.push({
        jour: daysOfWeek[dayIndex],
        jourIndex: dayIndex,
        totalEtudiants: totalStudents,
        etudiantsParticipants: participatingStudents,
        tauxParticipation: parseFloat(rate),
        tauxParticipationFormate: `${rate}%`
      });
    }

    return results;
  }

  /**
   * Calcule le taux de participation global
   * @returns {Promise<Object>}
   */
  async calculateGlobalParticipationRate() {
    const { literal, fn, col } = require('sequelize');
    const db = require('../models');

    const totalStudents = await etudiantRepository.countAll();
    
    const participatingStudents = await db.SessionReponse.count({
      distinct: true,
      col: 'etudiantId'
    });

    const rate = totalStudents > 0 
      ? ((participatingStudents / totalStudents) * 100).toFixed(2)
      : 0;

    return {
      totalEtudiants: totalStudents,
      etudiantsParticipants: participatingStudents,
      tauxParticipation: parseFloat(rate),
      tauxParticipationFormate: `${rate}%`
    };
  }
}

module.exports = new ParticipationService();
