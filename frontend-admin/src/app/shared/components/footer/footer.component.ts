import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-left">
          <p>&copy; {{ currentYear }} EQuizz Admin. Tous droits réservés.</p>
        </div>
        <div class="footer-right">
          <a href="#" class="footer-link">Aide</a>
          <a href="#" class="footer-link">Documentation</a>
          <a href="#" class="footer-link">Contact</a>
          <a href="#" class="footer-link">Confidentialité</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: white;
      border-top: 1px solid #e5e7eb;
      padding: 1.5rem 2rem;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-left {
      p {
        margin: 0;
        color: #666;
        font-size: 0.875rem;
      }
    }

    .footer-right {
      display: flex;
      gap: 1.5rem;
    }

    .footer-link {
      color: #666;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;

      &:hover {
        color: #4f46e5;
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
      }

      .footer-right {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
