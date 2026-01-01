import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const QuizCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Header avec titre et badge */}
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        <Animated.View style={[styles.badgeSkeleton, { opacity }]} />
      </View>

      {/* Sous-titre (nom du cours) */}
      <Animated.View style={[styles.subtitleSkeleton, { opacity }]} />

      {/* Footer avec date */}
      <View style={styles.cardFooter}>
        <Animated.View style={[styles.dateSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

// Liste de skeletons pour les quiz
export const QuizCardSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <QuizCardSkeleton key={index} />
      ))}
    </>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSkeleton: {
    height: 44, // 2 lignes de texte
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginRight: 12,
  },
  badgeSkeleton: {
    width: 80,
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  subtitleSkeleton: {
    height: 18,
    width: '60%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSkeleton: {
    height: 16,
    width: '40%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
});