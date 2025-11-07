import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import Logo from '../../../Components/Logo';
import InputField from '../../../Components/InputField';
import CustomButton from '../../../Components/CustomButton';

const LoginScreen = () => {
  const [adresseInstitutionnelle, setAdresseInstitutionnelle] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!adresseInstitutionnelle || !password) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer votre adresse institutionnelle et votre mot de passe.'
      );
      return;
    }
    console.log({ adresseInstitutionnelle, password });
    Alert.alert('Connexion', 'Tentative de connexion...');
  };

  const handleRegister = () => {
    // Navigue vers l'écran d'inscription
    router.push('/Views/RegisterScreen'); // Chemin relatif au dossier app/
  };

  const handleCardLogin = () => {
    Alert.alert('Carte Scolaire', 'Connexion via carte scolaire...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenue sur la plateforme</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.logoWrapper}>
            <Logo />
          </View>

          <InputField
            placeholder="Adresse institutionnelle"
            value={adresseInstitutionnelle}
            onChangeText={setAdresseInstitutionnelle}
            keyboardType="email-address"
          />
          <InputField
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
          />

          <CustomButton title="Connexion" onPress={handleLogin} />

          <TouchableOpacity onPress={handleRegister} style={styles.link}>
            <Text style={styles.linkText}>S’inscrire ?</Text>
          </TouchableOpacity>
        </View>

        {/* <CustomButton
          title="Se connecter avec sa carte scolaire"
          onPress={handleCardLogin}
          style={styles.cardLoginButton}
          textStyle={styles.cardLoginButtonText}
        /> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3E66' },
  keyboardAvoidingView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
},
  header: { 
    marginBottom: 40, 
    marginTop: -80 
},
  welcomeText: { 
    fontSize: 25, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom:20,
    textAlign:'center',
    padding:20,
},
  card: {
    backgroundColor: '#3A5689',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  logoWrapper: { 
    marginTop: -90, 
    marginBottom: 0 
  },
  link: { 
    marginTop: 20, 
    alignSelf: 'center' 
  },
  linkText: { color: '#E0E0E0', fontSize: 16, textDecorationLine: 'underline' },
  cardLoginButton: {
    backgroundColor: '#253454',
    borderColor: '#FFF',
    borderWidth: 1,
    width: '90%',
    maxWidth: 400,
    paddingVertical: 14,
  },
  cardLoginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default LoginScreen;
