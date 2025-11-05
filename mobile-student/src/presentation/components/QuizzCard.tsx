import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Evaluation } from '../../domain/entities/Evaluation';
import { MaterialIcons } from '@expo/vector-icons';

interface QuizzCardProps {
  evaluation: Evaluation;
  onPress: (id: string) => void;
}

export const QuizzCard: React.FC<QuizzCardProps> = ({ evaluation, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatut = () => {
    if (evaluation.statut) return evaluation.statut;
    
    const now = new Date();
    const debut = new Date(evaluation.dateDebut);
    const fin = new Date(evaluation.dateFin);
    
    if (now < debut) return 'À venir';
    if (now > fin) return 'Terminé';
    return 'En cours';
  };

  const statut = getStatut();
  const isExpired = statut === 'Terminé';
  const isUpcoming = statut === 'À venir';

  const getStatutColor = () => {
    switch (statut) {
      case 'En cours': return '#10B981';
      case 'À venir': return '#F59E0B';
      case 'Terminé': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatutBgColor = () => {
    switch (statut) {
      case 'En cours': return '#D1FAE5';
      case 'À venir': return '#FEF3C7';
      case 'Terminé': return '#F3F4F6';
      default: return '#F3F4F6';
    }
  };

  return (
    <View style={[styles.card, (isExpired || isUpcoming) && styles.cardDisabled]}>
      {/* Header avec titre et badge statut */}
      <View style={styles.header}>
        <Text style={styles.ueTitle}>UE - {evaluation.Cours.nom}</Text>
        <View style={[styles.statutBadge, { backgroundColor: getStatutBgColor() }]}>
          <Text style={[styles.statutText, { color: getStatutColor() }]}>
            {statut}
          </Text>
        </View>
      </View>

      {/* Classes */}
      {evaluation.Classes && evaluation.Classes.length > 0 && (
        <View style={styles.classesContainer}>
          <MaterialIcons name="school" size={16} color="#6B7280" />
          <Text style={styles.classesText}>
            {evaluation.Classes.map(c => c.nom).join(', ')}
          </Text>
        </View>
      )}

      {/* Informations */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MaterialIcons name="quiz" size={18} color="#3A5689" />
          <Text style={styles.infoText}>
            {evaluation.nombreQuestions || '?'} questions
          </Text>
        </View>
      </View>

      {/* Période */}
      <View style={styles.periodContainer}>
        <MaterialIcons name="event" size={16} color="#6B7280" />
        <Text style={styles.periodText}>
          {formatDate(evaluation.dateDebut)} - {formatDate(evaluation.dateFin)}
        </Text>
      </View>

      {/* Bouton Évaluer */}
      <TouchableOpacity
        style={[
          styles.evaluateButton,
          (isExpired || isUpcoming) && styles.evaluateButtonDisabled
        ]}
        onPress={() => onPress(evaluation.id)}
        disabled={isExpired || isUpcoming}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.evaluateButtonText,
          (isExpired || isUpcoming) && styles.evaluateButtonTextDisabled
        ]}>
          {isExpired ? 'Terminé' : isUpcoming ? 'Pas encore disponible' : 'Évaluer'}
        </Text>
        {!isExpired && !isUpcoming && (
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardDisabled: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ueTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 12,
  },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  classesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  classesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  periodText: {
    fontSize: 13,
    color: '#6B7280',
  },
  evaluateButton: {
    backgroundColor: '#3A5689',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  evaluateButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  evaluateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  evaluateButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
