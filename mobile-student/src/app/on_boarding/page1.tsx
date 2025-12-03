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
                <Text style={styles.nextText}>Suivant
                    <MaterialIcons name="arrow-forward-ios" size={20} color="#3A5689" />
                </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
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
        fontSize: 30
    },
    skipButton: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: 15,
        alignItems: 'flex-start',
    },
    skipText: {
        color: '#212121',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        flex: 1,
        
        borderRadius: 25,
        alignItems: 'flex-end',
        marginLeft: 20,
    },
    nextText: {
        color: '#212121',
        fontSize: 15,
        fontWeight: 'bold',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
});