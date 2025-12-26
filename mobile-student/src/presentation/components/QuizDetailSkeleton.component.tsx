import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { StyleSheet } from "react-native";

export const QuizDetailSkeleton: React.FC = () => {
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
    <View style={detailStyles.container}>
      {/* Header */}
      <View style={detailStyles.header}>
        <Animated.View style={[detailStyles.headerIconSkeleton, { opacity }]} />
        <View style={detailStyles.headerContent}>
          <Animated.View style={[detailStyles.headerTitleSkeleton, { opacity }]} />
          <Animated.View style={[detailStyles.headerSubtitleSkeleton, { opacity }]} />
        </View>
      </View>

      {/* Barre de progression */}
      <View style={detailStyles.progressContainer}>
        <View style={detailStyles.progressBar}>
          <Animated.View style={[detailStyles.progressFill, { opacity }]} />
        </View>
      </View>

      {/* Question Card */}
      <View style={detailStyles.content}>
        <View style={detailStyles.questionCard}>
          {/* Question Header */}
          <View style={detailStyles.questionHeader}>
            <Animated.View style={[detailStyles.questionNumberSkeleton, { opacity }]} />
            <Animated.View style={[detailStyles.typeBadgeSkeleton, { opacity }]} />
          </View>

          {/* Question Text */}
          <Animated.View style={[detailStyles.questionTextSkeleton, { opacity }]} />

          {/* Options */}
          <View style={detailStyles.optionsContainer}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={detailStyles.optionSkeleton}>
                <Animated.View style={[detailStyles.optionRadioSkeleton, { opacity }]} />
                <Animated.View style={[detailStyles.optionTextSkeleton, { opacity }]} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={detailStyles.navigation}>
        <Animated.View style={[detailStyles.navButtonSkeleton, { opacity }]} />
        <Animated.View style={[detailStyles.navButtonSkeletonLarge, { opacity }]} />
      </View>
    </View>
  );
};

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3A5689',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 120,
    paddingTop: 75,
  },
  headerIconSkeleton: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitleSkeleton: {
    height: 20,
    width: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  headerSubtitleSkeleton: {
    height: 16,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '30%',
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumberSkeleton: {
    height: 16,
    width: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  typeBadgeSkeleton: {
    height: 28,
    width: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  questionTextSkeleton: {
    height: 52, // 2 lignes
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionRadioSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  optionTextSkeleton: {
    flex: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  navButtonSkeleton: {
    height: 48,
    width: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  navButtonSkeletonLarge: {
    flex: 1,
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});