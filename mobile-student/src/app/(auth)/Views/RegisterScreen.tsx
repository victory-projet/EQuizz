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
import DIContainer from '../../../core/di/container';
import Logo from '../../../presentation/components/Logo';
import InputField from '../../../presentation/components/InputField';
import CustomButton from '../../../presentation/components/CustomButton';
import { ClassePicker } from '../../../presentation/components/ClassePicker';
import { useClasses } from '../../../presentation/hooks/useClasses';
import LoadingSpinner from '../../../presentation/components/LoadingSpinner.component';

const RegisterScreen = () => {
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [classeId, setClasseId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Charger les classes disponibles
  const { classes, loading: loadingClasses, error: classesError } = useClasses();

  const handleValidation = async () => {
    if (!matricule || !email || !classeId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const container = DIContainer.getInstance();
      const claimAccountUseCase = container.claimAccountUseCase;
      
      await claimAccountUseCase.execute(matricule, email, classeId);
      
      Alert.alert(
        'Succès',
        'Votre compte a été créé ! Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'Se connecter',
            onPress: () => router.replace('/(auth)/Views/LoginScreen'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
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
              autoCapitalize="none"
            />

            <InputField
              placeholder="Email institutionnel"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {loadingClasses ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner />
                <Text style={styles.loadingText}>Chargement des classes...</Text>
              </View>
            ) : classesError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{classesError}</Text>
              </View>
            ) : (
              <ClassePicker
                classes={classes}
                selectedClasseId={classeId}
                onSelectClasse={setClasseId}
                placeholder="Sélectionnez votre classe"
              />
            )}

            <CustomButton 
              title={loading ? "Création..." : "Créer mon compte"} 
              onPress={handleValidation}
            />

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/Views/LoginScreen')}
              style={styles.link}
            >
              <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
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
    marginBottom: 30,
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
    marginBottom: -20,
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#E0E0E0',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RegisterScreen;
