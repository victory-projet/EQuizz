import { View, Image, StyleSheet } from 'react-native'
import React from 'react'


export default function Logo() {
  return (
      <View style={styles.logoContainer}>
      {/* Remplacez ' votre_logo.png' par le chemin réel de votre image de logo */}
      <Image
        source={require('@/assets/images/logo1.png')} // Assurez-vous d'avoir votre logo dans le dossier assets
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  )
}
const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120, // Ajustez la taille selon vos besoins
    height: 120,
    borderRadius: 60, // Pour un logo circulaire
    backgroundColor: '#4A2A5E', // Couleur de fond du cercle du logo
    justifyContent: 'center',
    alignItems: 'center',
  },
});