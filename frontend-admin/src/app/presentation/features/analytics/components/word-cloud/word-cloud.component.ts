import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WordData {
  text: string;
  size: number;
  count: number;
}

@Component({
  selector: 'app-word-cloud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="word-cloud-container">
      <div class="word-cloud-header">
        <h3>Nuage de Mots-Clés</h3>
        <p class="subtitle">Mots les plus fréquents dans les réponses ouvertes</p>
      </div>

      <div class="word-cloud" #wordCloudCanvas>
        @for (word of words(); track word.text) {
          <span 
            class="word" 
            [style.font-size.px]="word.size"
            [style.color]="getRandomColor()"
            [title]="word.count + ' occurrences'"
          >
            {{ word.text }}
          </span>
        }
      </div>

      <div class="word-list">
        <h4>Top 10 des mots</h4>
        <div class="word-list-items">
          @for (word of words().slice(0, 10); track word.text; let i = $index) {
            <div class="word-item">
              <span class="word-rank">{{ i + 1 }}</span>
              <span class="word-text">{{ word.text }}</span>
              <span class="word-count">{{ word.count }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .word-cloud-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .word-cloud-header {
      margin-bottom: 2rem;

      h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: #666;
        font-size: 0.875rem;
      }
    }

    .word-cloud {
      min-height: 400px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .word {
      display: inline-block;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      padding: 0.25rem 0.5rem;
      animation: fadeIn 0.5s ease-in;

      &:hover {
        transform: scale(1.2);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .word-list {
      background: #f9fafb;
      border-radius: 12px;
      padding: 1.5rem;

      h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 1rem;
      }
    }

    .word-list-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .word-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: white;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .word-rank {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #7571f9;
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .word-text {
      flex: 1;
      font-weight: 600;
      color: #1a1a1a;
    }

    .word-count {
      padding: 0.25rem 0.75rem;
      background: #e5e7eb;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    @media (max-width: 768px) {
      .word-cloud-container {
        padding: 1rem;
      }

      .word-cloud {
        min-height: 300px;
        padding: 1rem;
      }
    }
  `]
})
export class WordCloudComponent implements OnInit {
  @ViewChild('wordCloudCanvas') wordCloudCanvas!: ElementRef;

  words = signal<WordData[]>([]);

  private colors = [
    '#7571f9', '#a29bfe', '#6c5ce7', '#fd79a8', '#fdcb6e',
    '#00b894', '#00cec9', '#0984e3', '#e17055', '#d63031'
  ];

  ngOnInit(): void {
    this.generateWordCloud();
  }

  generateWordCloud(): void {
    // Simulation de données - À remplacer par de vraies données d'analyse
    const mockWords = [
      { text: 'algorithme', count: 45 },
      { text: 'complexité', count: 38 },
      { text: 'récursivité', count: 32 },
      { text: 'tri', count: 30 },
      { text: 'recherche', count: 28 },
      { text: 'tableau', count: 25 },
      { text: 'fonction', count: 23 },
      { text: 'itération', count: 20 },
      { text: 'structure', count: 18 },
      { text: 'données', count: 17 },
      { text: 'performance', count: 15 },
      { text: 'optimisation', count: 14 },
      { text: 'mémoire', count: 12 },
      { text: 'temps', count: 11 },
      { text: 'espace', count: 10 },
      { text: 'efficace', count: 9 },
      { text: 'rapide', count: 8 },
      { text: 'solution', count: 7 },
      { text: 'problème', count: 6 },
      { text: 'méthode', count: 5 }
    ];

    // Calculer les tailles en fonction de la fréquence
    const maxCount = Math.max(...mockWords.map(w => w.count));
    const minSize = 16;
    const maxSize = 64;

    const wordsWithSize = mockWords.map(word => ({
      text: word.text,
      count: word.count,
      size: minSize + ((word.count / maxCount) * (maxSize - minSize))
    }));

    // Mélanger les mots pour un affichage aléatoire
    this.words.set(this.shuffleArray(wordsWithSize));
  }

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
