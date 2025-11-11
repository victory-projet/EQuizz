import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
    const router = useRouter();
    const logo = require('@/assets/images/logo2.png');
    const load = require('@/assets/images/load.png');

    useEffect(() => {
        const timer = setTimeout(() => {
        router.replace('/on_boarding/page1');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <LinearGradient
        colors={['#3A5689', '#6D8DC7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
        >
        <View style={styles.container}>
            <Image source={logo} style={styles.img} contentFit="contain" />
            <Text style={styles.titre}>EQuizz</Text>
            <Text style={styles.texte}>Evaluez Mieux, Apprenez Plus !</Text>
            <Text style={styles.texte1}>Évalue les enseignements de 
                façon fun et anonyme.</Text>
        </View>
        <View style={styles.container1}>
            <Image source={load} style={styles.img1} />
        </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container1: {
        alignItems: 'center',
        bottom: 50, // Position en bas
    },
    img: {
        height: 249,
        width: 289,
    },
    img1: {
        height: 150,
        width: 150,
        tintColor: 'white', // Force la couleur blanche si l'image n'est pas déjà blanche (optionnel)
    },
    titre: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        fontSize: 32,
        marginBottom: 10,
    },
    texte: {
        paddingTop: 10,
        textAlign: 'center',
        color: 'white',
        fontSize: 28,
        lineHeight: 24,
        marginBottom: 10,
    },
    texte1: {
        textAlign: 'center',
        color: 'white',
        fontSize: 20,
        lineHeight: 24,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
    },
});