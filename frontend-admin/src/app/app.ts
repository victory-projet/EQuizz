import { Component, signal } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
 
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('equizz-admin-web');
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
