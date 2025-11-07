import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Logo from '../../../Components/Logo';
import InputField from '../../../Components/InputField';
import CustomButton from '../../../Components/CustomButton';

const RegisterScreen = () => {
  const [matricule, setMatricule] = useState('');
  const [classe, setClasse] = useState('');
  const [adresseInstitutionnelle, setAdresseInstitutionnelle] = useState('');
  const router = useRouter();

  const handleValidation = () => {
    if (!matricule || !classe || !adresseInstitutionnelle) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    console.log({ matricule, classe, adresseInstitutionnelle });
    Alert.alert('Succès', 'Informations d’inscription soumises !');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Bienvenue sur la plateforme</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.logoWrapper}>
              <Logo />
            </View>

            <InputField
              placeholder="Matricule"
              value={matricule}
              onChangeText={setMatricule}
              keyboardType="email-address"
            />

            <InputField
              placeholder="Classe"
              value={classe}
              onChangeText={setClasse}
            />

            <InputField
              placeholder="Adresse institutionnelle"
              value={adresseInstitutionnelle}
              onChangeText={setAdresseInstitutionnelle}
              keyboardType="email-address"
            />

            <CustomButton title="Valider" onPress={handleValidation} />

            <TouchableOpacity
              onPress={() => router.push('/Views/LoginScreen')}
              style={styles.link}
            >
              <Text style={styles.linkText}>Se connecter ?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E66',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 40, 
    marginTop: -80
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom:30,
    padding: 10,
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
    marginBottom:-20,
  },
  logoWrapper: {
    marginTop: -90,
    marginBottom: 5,
  },
  link: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    color: '#E0E0E0',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
