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
      month: 'long',
      year: 'numeric',
    });
  };

  const isExpired = new Date(evaluation.dateFin) < new Date();

  return (
    <TouchableOpacity
      style={[styles.card, isExpired && styles.cardExpired]}
      onPress={() => !isExpired && onPress(evaluation.id)}
      disabled={isExpired}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="quiz" size={24} color="#3A5689" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.courseName}>{evaluation.Cours.nom}</Text>
          <Text style={styles.quizzTitle}>{evaluation.titre}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            Date limite: {formatDate(evaluation.dateFin)}
          </Text>
        </View>
        {isExpired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expiré</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardExpired: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A5689',
    marginBottom: 4,
  },
  quizzTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  expiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
