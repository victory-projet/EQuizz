import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalConfirmationComponent } from './presentation/shared/components/global-confirmation/global-confirmation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalConfirmationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend-admin');
}
