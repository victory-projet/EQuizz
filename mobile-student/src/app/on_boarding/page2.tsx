import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { completeOnboarding } from '@/src/utils/onboarding';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page3() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/on_boarding/page3');
    };

    const handleSkip = () => {
        completeOnboarding();
        router.replace('/(auth)/Views/LoginScreen');
    };
    
    const illustration = require('@/assets/images/illustration3.png');

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#3A5689', '#6D8DC7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.illustrationContainer}
                >
                    <Image source={illustration} style={styles.illustration} />
                </LinearGradient>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>
                        Evaluez vos enseignements simplement
                    </Text>

                    <Text style={styles.subtitle}>
                        Ton feedback pour un meilleur enseignement.
                    </Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={styles.skipButton} 
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipText}>Ignorer</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.nextButton} 
                        onPress={handleNext}
                        activeOpacity={0.7}
                    >
                        <View style={styles.nextButtonContent}>
                            <Text style={styles.nextText}>Suivant</Text>
                            <MaterialIcons name="arrow-forward-ios" size={18} color="#3A5689" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    illustrationContainer: {
        alignItems: 'center',
        borderBottomRightRadius: 200,
        borderBottomLeftRadius: 200,
        backgroundColor: '#3A5689',
        ...Platform.select({
            ios: {
                height: 500,
            },
            android: {
                height: 450,
            },
        }),
    },
    illustration: {
        marginTop: Platform.select({
            ios: 150,
            android: 120,
        }),
        width: 280,
        height: 350,
        resizeMode: 'contain',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 30,
        paddingBottom: Platform.select({
            ios: 20,
            android: 30,
        }),
    },
    skipButton: {
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    skipText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    nextButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nextText: {
        color: '#3A5689',
        fontSize: 16,
        fontWeight: '700',
    },
});