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
import DIContainer from '../../core/di/container';

const container = DIContainer.getInstance();
import { COLORS } from '../../core/constants';

export default function ClaimAccountScreen() {
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [classeId, setClasseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    }

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!classeId.trim()) {
      newErrors.classeId = 'La classe est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClaimAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const claimAccountUseCase = container.claimAccountUseCase;
      await claimAccountUseCase.execute(matricule, email, classeId);

      Alert.alert(
        'Succès',
        'Si vos informations sont valides, vous recevrez un email avec vos identifiants de connexion.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login' as any),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
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
          <Text style={styles.title}>Bienvenue sur EQuizz</Text>
          <Text style={styles.subtitle}>Activez votre compte étudiant</Text>
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
            label="Email institutionnel"
            placeholder="votre.email@saintjeaningenieur.org"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomTextInput
            label="Classe"
            placeholder="Entrez votre classe"
            value={classeId}
            onChangeText={setClasseId}
            error={errors.classeId}
          />

          <PrimaryButton
            title="Activer mon compte"
            onPress={handleClaimAccount}
            loading={loading}
            style={styles.button}
          />

          <PrimaryButton
            title="Se connecter"
            onPress={() => router.replace('/login' as any)}
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
