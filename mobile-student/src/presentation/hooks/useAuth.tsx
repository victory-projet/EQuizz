import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Utilisateur } from '../../domain/entities/Utilisateur';
import DIContainer from '../../core/di/container';

const container = DIContainer.getInstance();
import { STORAGE_KEYS } from '../../core/constants';

interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (matricule: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUtilisateur(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (matricule: string, motDePasse: string) => {
    const loginUseCase = container.loginUseCase;
    const result = await loginUseCase.execute(matricule, motDePasse);
    
    console.log('✅ Login successful:', { 
      token: result.token.substring(0, 20) + '...', 
      user: result.utilisateur 
    });
    
    setToken(result.token);
    setUtilisateur(result.utilisateur);
    
    // Récupérer les informations complètes de l'étudiant
    try {
      console.log('📡 Fetching complete student info...');
      const getStudentInfoUseCase = container.getStudentInfoUseCase;
      const completeInfo = await getStudentInfoUseCase.execute();
      console.log('✅ Complete student info:', completeInfo);
      setUtilisateur(completeInfo);
    } catch (error) {
      console.error('⚠️ Could not fetch complete student info:', error);
      // On continue quand même avec les infos du login
    }
  };

  const logout = async () => {
    await container.authRepository.logout();
    setToken(null);
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        token,
        isLoading,
        isAuthenticated: !!token && !!utilisateur,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
