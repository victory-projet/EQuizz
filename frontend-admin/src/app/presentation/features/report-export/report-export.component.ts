import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-export">
      <h3>Export de rapport</h3>
      <p>Fonctionnalité en cours de développement...</p>
    </div>
  `,
  styles: [`
    .report-export {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
  `]
})
export class ReportExportComponent {
}