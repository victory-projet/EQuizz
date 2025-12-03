import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { completeOnboarding } from '@/src/utils/onboarding';

export default function Page2() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/on_boarding/page3');
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(auth)/Views/LoginScreen');
    };
    const illustration = require('@/assets/images/illustration3.png');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={['#3A5689', '#6D8DC7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.illustrationContainer}
                >
                    <Image source={illustration} style={styles.illustration} />
                </LinearGradient>

                <Text style={styles.title}>Evaluez vos enseignements
                simplement</Text>

                <Text style={styles.subtitle}>
                    Ton feedback pour un 
                    meilleur enseignement.
                </Text>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipText}>Ignorer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextText}>Suivant 
                            <MaterialIcons name="arrow-forward-ios" size={20} color="white" />
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    illustrationContainer: {
        alignItems: 'center',
        borderBottomRightRadius: 200,
        borderBottomLeftRadius: 200,
        backgroundColor: '#3A5689',
        height: 400,
        justifyContent: 'center',
    },
    illustration: {
        width: 250,
        height: 300,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 30,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#212121',
        textAlign: 'center',
        lineHeight: 24,
        marginHorizontal: 40,
        marginBottom: 30,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
        marginTop: 20,
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
        backgroundColor: '#3A5689',
        borderRadius: 25,
        alignItems: 'center',
        marginLeft: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    nextText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});