import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { CustomTextInput } from '../../presentation/components/CustomTextInput';
import { PrimaryButton } from '../../presentation/components/PrimaryButton';
import { useAuth } from '../../presentation/hooks/useAuth';
import { COLORS } from '../../core/constants';

export default function LoginScreen() {
  const [matricule, setMatricule] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    }

    if (!motDePasse.trim()) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('🔑 Starting login...');
      await login(matricule, motDePasse);
      console.log('✅ Login completed, navigating to accueil...');
      
      // Petit délai pour s'assurer que le state est mis à jour
      setTimeout(() => {
        console.log('🚀 Navigating now...');
        router.replace('/(tabs)/accueil');
      }, 100);
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue sur la plateforme</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
        </View>

        <View style={styles.form}>
          <CustomTextInput
            label="Matricule"
            placeholder="Entrez votre matricule"
            value={matricule}
            onChangeText={setMatricule}
            error={errors.matricule}
            autoCapitalize="none"
          />

          <CustomTextInput
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            value={motDePasse}
            onChangeText={setMotDePasse}
            error={errors.motDePasse}
            secureTextEntry
          />

          <PrimaryButton
            title="Connexion"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <PrimaryButton
            title="S'inscrire ?"
            onPress={() => router.replace('/claim-account' as any)}
            variant="secondary"
            style={styles.buttonSecondary}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  buttonSecondary: {
    marginTop: 12,
  },
});
