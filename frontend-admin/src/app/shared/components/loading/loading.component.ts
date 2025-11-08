// src/app/shared/components/loading/loading.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = 'Chargement...';
  @Input() overlay = false;
  @Input() fullscreen = false;
}
