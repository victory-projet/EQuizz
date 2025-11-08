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
import { useAuth } from '../../../presentation/hooks/useAuth';
import Logo from '../../../presentation/components/Logo';
import InputField from '../../../presentation/components/InputField';
import CustomButton from '../../../presentation/components/CustomButton';

const LoginScreen = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!matricule || !password) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer votre matricule et votre mot de passe.'
      );
      return;
    }

    try {
      setLoading(true);
      await login(matricule, password);
      // La navigation est gérée automatiquement par _layout.tsx
    } catch (error) {
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/Views/RegisterScreen');
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
            placeholder="Matricule"
            value={matricule}
            onChangeText={setMatricule}
            autoCapitalize="none"
          />
          
          <InputField
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
          />

          <CustomButton 
            title={loading ? "Connexion..." : "Se connecter"} 
            onPress={handleLogin}
          />

          <TouchableOpacity onPress={handleRegister} style={styles.link}>
            <Text style={styles.linkText}>Première connexion ? S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#2C3E66' 
  },
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
    marginBottom: 20,
    textAlign: 'center',
    padding: 20,
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
  linkText: { 
    color: '#E0E0E0', 
    fontSize: 16, 
    textDecorationLine: 'underline' 
  },
});

export default LoginScreen;
