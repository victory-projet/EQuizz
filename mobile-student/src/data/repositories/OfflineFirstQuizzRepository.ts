import NetInfo from '@react-native-community/netinfo';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz, QuizzSubmission } from '../../domain/entities/Quizz';
import { QuizzHistory } from '../../domain/entities/QuizzHistory';
import { QuizzRepository } from '../../domain/repositories/QuizzRepository';
import { OfflineQuizzDataSource } from '../datasources/OfflineQuizzDataSource';
import { QuizzDataSource } from '../datasources/QuizzDataSource';

/**
 * Repository offline-first pour les quizz.
 *
 * Stratégie :
 *  - Online  → appelle l'API, met le cache à jour, retourne le résultat
 *  - Offline → retourne le cache SQLite
 *
 * Pré-cache : dès qu'on charge la liste en ligne, on télécharge et met en
 * cache les questions de TOUS les quiz non terminés, pour qu'ils soient
 * disponibles hors connexion sans que l'étudiant ait besoin de les ouvrir.
 *
 * La soumission offline est mise en file d'attente dans SQLite.
 * Elle est envoyée au serveur par QuizzSyncService dès que le réseau revient.
 */
export class OfflineFirstQuizzRepository implements QuizzRepository {
  constructor(
    private readonly remoteDataSource: QuizzDataSource,
    private readonly offlineDataSource: OfflineQuizzDataSource,
  ) {}

  private async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  }

  // ─── Liste des évaluations ────────────────────────────────────────────────

  async getAvailableQuizzes(): Promise<Evaluation[]> {
    if (await this.isOnline()) {
      try {
        const evaluations = await this.remoteDataSource.getAvailableQuizzes();

        // Cacher les évaluations en arrière-plan
        this.offlineDataSource.cacheEvaluations(evaluations).catch((e) =>
          console.warn('⚠️ Cache evaluations failed:', e),
        );

        // Pré-cacher les détails (questions) de tous les quiz non terminés
        // pour qu'ils soient accessibles hors connexion
        this._prefetchQuizDetails(evaluations);

        return evaluations;
      } catch (err) {
        console.warn('⚠️ API indisponible, utilisation du cache:', err);
        return this.offlineDataSource.getCachedEvaluations();
      }
    }

    console.log('📴 Mode offline – lecture du cache evaluations');
    return this.offlineDataSource.getCachedEvaluations();
  }

  /**
   * Télécharge et met en cache les questions de tous les quiz disponibles.
   * S'exécute entièrement en arrière-plan, sans bloquer l'UI.
   */
  private _prefetchQuizDetails(evaluations: Evaluation[]): void {
    const quizToFetch = evaluations.filter(
      (ev) =>
        ev.Quizz?.id &&
        ev.statutEtudiant !== 'TERMINE',
    );

    if (quizToFetch.length === 0) return;

    console.log(`📥 Pré-cache de ${quizToFetch.length} quiz(zes) en arrière-plan...`);

    // On lance tout en parallèle sans await pour ne pas bloquer
    Promise.allSettled(
      quizToFetch.map(async (ev) => {
        const quizzId = ev.Quizz!.id;
        try {
          // Vérifier si on a déjà les questions en cache
          const cached = await this.offlineDataSource.getCachedQuizzDetails(quizzId);
          if (cached && cached.Questions.length > 0) {
            // Déjà en cache, pas besoin de re-télécharger
            return;
          }

          const quizz = await this.remoteDataSource.getQuizzDetails(quizzId);
          await this.offlineDataSource.cacheQuizzDetails(quizz);
          console.log(`✅ Quiz "${quizz.titre}" mis en cache (${quizz.Questions.length} questions)`);
        } catch (err) {
          console.warn(`⚠️ Impossible de pré-cacher le quiz ${quizzId}:`, err);
        }
      }),
    ).then((results) => {
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const ko = results.filter((r) => r.status === 'rejected').length;
      console.log(`📥 Pré-cache terminé: ${ok} OK, ${ko} échec(s)`);
    });
  }

  // ─── Détail d'un quizz ────────────────────────────────────────────────────

  async getQuizzDetails(id: string): Promise<Quizz> {
    if (await this.isOnline()) {
      try {
        const quizz = await this.remoteDataSource.getQuizzDetails(id);
        // Mettre à jour le cache à chaque ouverture en ligne
        this.offlineDataSource.cacheQuizzDetails(quizz).catch((e) =>
          console.warn('⚠️ Cache quizz details failed:', e),
        );
        return quizz;
      } catch (err) {
        console.warn('⚠️ API indisponible, utilisation du cache quizz:', err);
        const cached = await this.offlineDataSource.getCachedQuizzDetails(id);
        if (!cached) throw new Error('Quizz non disponible hors connexion');
        return cached;
      }
    }

    console.log('📴 Mode offline – lecture du cache quizz', id);
    const cached = await this.offlineDataSource.getCachedQuizzDetails(id);
    if (!cached) {
      throw new Error(
        'Les questions de ce quiz ne sont pas disponibles hors connexion.\n' +
        'Ouvrez ce quiz une fois en ligne pour le télécharger.',
      );
    }
    return cached;
  }

  // ─── Soumission des réponses ──────────────────────────────────────────────

  async submitAnswers(
    quizzId: string,
    submission: QuizzSubmission,
    options?: { evaluationId?: string; userId?: string },
  ): Promise<void> {
    if (await this.isOnline()) {
      try {
        await this.remoteDataSource.submitAnswers(quizzId, submission);
        if (options?.evaluationId) {
          await this.offlineDataSource.updateEvaluationStatus(
            options.evaluationId,
            'TERMINE',
          );
        }
        return;
      } catch (err) {
        console.warn('⚠️ Soumission API échouée, mise en file d\'attente offline:', err);
      }
    }

    // Offline ou API en échec → file d'attente locale
    console.log('📴 Soumission offline – mise en file d\'attente');
    await this.offlineDataSource.savePendingSubmission(
      quizzId,
      options?.evaluationId ?? '',
      options?.userId ?? 'unknown',
      submission,
    );

    if (options?.evaluationId) {
      await this.offlineDataSource.updateEvaluationStatus(
        options.evaluationId,
        'TERMINE',
      );
    }
  }

  // ─── Historique ───────────────────────────────────────────────────────────

  async getQuizzHistory(): Promise<QuizzHistory[]> {
    if (await this.isOnline()) {
      try {
        return await this.remoteDataSource.getQuizzHistory();
      } catch (err) {
        console.warn('⚠️ Historique API indisponible:', err);
        return [];
      }
    }
    return [];
  }
}
