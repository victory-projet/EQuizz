// src/app/pages/home/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Rediriger vers le dashboard si déjà connecté
      this.router.navigate(['/dashboard']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
