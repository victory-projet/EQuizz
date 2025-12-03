import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { completeOnboarding } from '@/src/utils/onboarding';

export default function Page3() {
    const router = useRouter();

    const handleStart = () => {
        completeOnboarding();
        router.replace('/(auth)/Views/LoginScreen');
    };

    const peekingCharacter = require('@/assets/images/illustration2.png');

    return (
        <View style={styles.mainContainer}>
            <View style={styles.leftView} />

            <View style={styles.rightView} />
            <Image source={peekingCharacter} style={styles.character} />
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startText}>Commencer</Text>
                <MaterialIcons name="arrow-forward-ios" size={20} color="#3A5689" style={styles.icon} />
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    leftView: {
        flex: 0.7,
        backgroundColor: '#6D8DC7',
        width: 200
    },
    rightView: {
        flex: 0.3,
        backgroundColor: '#3A5689',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    character: {
        position: 'absolute',
        right: -15,
        top: 90,
        width: 450,
        height: 580,
        resizeMode: 'contain',
        zIndex: 1,
    },
    startButton: {
        position: 'absolute',
        bottom: 50,
        left: '21%',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 2,
        alignItems: 'center',
        width: 200,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    startText: {
        color: '#3A5689',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    icon: {
        marginLeft: 5
    }
});