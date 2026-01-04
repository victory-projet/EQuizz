import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook pour détecter le statut de connexion réseau
 * Utilise @react-native-community/netinfo pour une détection fiable
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Vérifier l'état initial
    NetInfo.fetch().then(state => {
      const online = state.isConnected === true && state.isInternetReachable === true;
      setIsOnline(online);
      console.log('🌐 État réseau initial:', online ? 'ONLINE' : 'OFFLINE');
    });

    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected === true && state.isInternetReachable === true;
      setIsOnline(online);
      console.log('🌐 Changement réseau:', online ? 'ONLINE' : 'OFFLINE');
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
}