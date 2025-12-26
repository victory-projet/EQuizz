import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { completeOnboarding } from '@/src/utils/onboarding';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Page2() {
    const router = useRouter();

    const handleStart = () => {
        completeOnboarding();
        router.replace('/(auth)/Views/LoginScreen');
    };

    const peekingCharacter = require('@/assets/images/illustration2.png');

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.mainContainer}>
                <View style={styles.leftView} />
                <View style={styles.rightView} />
                
                <Image source={peekingCharacter} style={styles.character} />
                
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity 
                        style={styles.startButton} 
                        onPress={handleStart}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.startText}>Commencer</Text>
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
        backgroundColor: '#3A5689',
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    leftView: {
        flex: 0.7,
        backgroundColor: '#6D8DC7',
    },
    rightView: {
        flex: 0.3,
        backgroundColor: '#3A5689',
    },
    character: {
        position: 'absolute',
        right: Platform.select({
            ios: -15,
            android: -20,
        }),
        top: Platform.select({
            ios: SCREEN_HEIGHT * 0.12,
            android: SCREEN_HEIGHT * 0.1,
        }),
        width: SCREEN_WIDTH * 1.2,
        height: SCREEN_HEIGHT * 0.7,
        resizeMode: 'contain',
        zIndex: 1,
    },
    buttonWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: Platform.select({
            ios: 20,
            android: 30,
        }),
        zIndex: 2,
    },
    startButton: {
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
        minWidth: 200,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    startText: {
        color: '#3A5689',
        fontSize: 18,
        fontWeight: '700',
    },
});