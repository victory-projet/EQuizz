import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sentiment-analysis">
      <h3>Analyse de sentiment</h3>
      <p>Fonctionnalité en cours de développement...</p>
    </div>
  `,
  styles: [`
    .sentiment-analysis {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
  `]
})
export class SentimentAnalysisComponent {
}