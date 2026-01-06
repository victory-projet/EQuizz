import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Interface pour les événements réseau
 */
export interface NetworkEvent {
  isOnline: boolean;
  connectionType: string;
  isInternetReachable: boolean | null;
  timestamp: number;
}

/**
 * Moniteur réseau avancé avec détection de qualité de connexion
 * Améliore la détection réseau avec des métriques de qualité
 */
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Array<(event: NetworkEvent) => void> = [];
  private currentState: NetworkEvent | null = null;
  private connectionHistory: NetworkEvent[] = [];
  private readonly MAX_HISTORY = 10;

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Initialise la surveillance réseau
   */
  private initializeMonitoring(): void {
    NetInfo.addEventListener(this.handleNetworkChange.bind(this));
    
    // Obtenir l'état initial
    NetInfo.fetch().then(this.handleNetworkChange.bind(this));
  }

  /**
   * Gère les changements d'état réseau
   */
  private handleNetworkChange(state: NetInfoState): void {
    const networkEvent: NetworkEvent = {
      isOnline: state.isConnected === true && state.isInternetReachable === true,
      connectionType: state.type,
      isInternetReachable: state.isInternetReachable,
      timestamp: Date.now()
    };

    // Détecter les changements significatifs
    const hasChanged = !this.currentState || 
      this.currentState.isOnline !== networkEvent.isOnline ||
      this.currentState.connectionType !== networkEvent.connectionType;

    if (hasChanged) {
      this.currentState = networkEvent;
      this.addToHistory(networkEvent);
      this.notifyListeners(networkEvent);
      
      console.log(`📡 Changement réseau: ${networkEvent.isOnline ? 'ONLINE' : 'OFFLINE'} (${networkEvent.connectionType})`);
    }
  }

  /**
   * Ajoute un événement à l'historique
   */
  private addToHistory(event: NetworkEvent): void {
    this.connectionHistory.unshift(event);
    if (this.connectionHistory.length > this.MAX_HISTORY) {
      this.connectionHistory = this.connectionHistory.slice(0, this.MAX_HISTORY);
    }
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(event: NetworkEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ Erreur dans listener réseau:', error);
      }
    });
  }

  /**
   * Ajoute un listener pour les changements réseau
   */
  public addListener(listener: (event: NetworkEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Envoyer l'état actuel immédiatement
    if (this.currentState) {
      listener(this.currentState);
    }
    
    // Retourner une fonction de nettoyage
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Obtient l'état réseau actuel
   */
  public getCurrentState(): NetworkEvent | null {
    return this.currentState;
  }

  /**
   * Vérifie si la connexion est stable
   */
  public isConnectionStable(): boolean {
    if (this.connectionHistory.length < 3) {
      return true; // Pas assez d'historique
    }

    const recentEvents = this.connectionHistory.slice(0, 3);
    const allOnline = recentEvents.every(event => event.isOnline);
    const allOffline = recentEvents.every(event => !event.isOnline);
    
    return allOnline || allOffline;
  }

  /**
   * Obtient la qualité de connexion estimée
   */
  public getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.currentState?.isOnline) {
      return 'offline';
    }

    const connectionType = this.currentState.connectionType.toLowerCase();
    
    if (connectionType.includes('wifi')) {
      return 'excellent';
    } else if (connectionType.includes('cellular') || connectionType.includes('4g') || connectionType.includes('5g')) {
      return 'good';
    } else if (connectionType.includes('3g') || connectionType.includes('2g')) {
      return 'poor';
    }
    
    return 'good'; // Par défaut
  }

  /**
   * Teste la connectivité avec un ping
   */
  public async testConnectivity(timeout: number = 5000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient les statistiques de connexion
   */
  public getConnectionStats(): {
    currentState: NetworkEvent | null;
    history: NetworkEvent[];
    isStable: boolean;
    quality: string;
    uptime: number;
    downtime: number;
  } {
    const now = Date.now();
    let uptime = 0;
    let downtime = 0;

    // Calculer uptime/downtime sur les dernières 24h
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const recentHistory = this.connectionHistory.filter(event => event.timestamp > dayAgo);

    for (let i = 0; i < recentHistory.length - 1; i++) {
      const current = recentHistory[i];
      const next = recentHistory[i + 1];
      const duration = current.timestamp - next.timestamp;

      if (current.isOnline) {
        uptime += duration;
      } else {
        downtime += duration;
      }
    }

    return {
      currentState: this.currentState,
      history: this.connectionHistory,
      isStable: this.isConnectionStable(),
      quality: this.getConnectionQuality(),
      uptime,
      downtime
    };
  }

  /**
   * Réinitialise l'historique
   */
  public clearHistory(): void {
    this.connectionHistory = [];
  }
}