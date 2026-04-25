/**
 * EventEmitter pour signaler les changements de state des quizz
 * Utilisé pour recharger la liste des quizz seulement quand nécessaire
 */
type QuizzEventListener = () => void;

class QuizzEventEmitterService {
  private listeners: Set<QuizzEventListener> = new Set();

  /**
   * S'abonner aux changements de quizz
   */
  subscribe(listener: QuizzEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Émettre un événement quand un quizz a été modifié
   * (complété, commencé, etc.)
   */
  emit(): void {
    console.log("Quizz modificé - rechargeant la liste...");
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Nettoyer tous les listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

export const quizzEventEmitter = new QuizzEventEmitterService();
