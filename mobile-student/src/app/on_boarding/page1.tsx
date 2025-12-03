import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { completeOnboarding } from '@/src/utils/onboarding';

export default function Page1() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/on_boarding/page2');
    };

    const handleSkip = () => {
        completeOnboarding();
        router.replace('/(auth)/Views/LoginScreen');
    };
    const illustration = require('@/assets/images/illustration1.png');

    return (

        <View style={styles.container}>
            <LinearGradient
                colors={['#3A5689', '#6D8DC7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.illustrationContainer}
            >
                <Image source={illustration} style={styles.illustration} />
            </LinearGradient>

            <Text style={styles.title}>Bienvenue sur Notre Application</Text>

            <Text style={styles.subtitle}>
                Participez à l'amélioration continue de la qualité de l'enseignement dans votre établissement.
            </Text>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Ignorer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Suivant</Text>
                    <MaterialIcons name="arrow-forward-ios" size={20} color="#3A5689" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
    },
    illustrationContainer: {
        alignItems: 'center',
        borderBottomRightRadius: 200,
        borderBottomLeftRadius: 200,
        backgroundColor: '#3A5689',
        height: 600
    },
    illustration: {
        marginTop: 200,
        width: 300,
        height: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#212121',
        textAlign: 'center',
        lineHeight: 24,
        marginHorizontal: 40,
        marginBottom: 100,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 50,
        alignItems: 'center',
    },
    skipButton: {
        backgroundColor: 'rgba(58, 86, 137, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3A5689',
    },
    skipText: {
        color: '#3A5689',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#3A5689',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    nextText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 5,
    },
});