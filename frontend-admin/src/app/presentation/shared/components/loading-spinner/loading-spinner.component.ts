// src/app/presentation/shared/components/loading-spinner/loading-spinner.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class]="'size-' + size">
      <div class="spinner" [style.border-color]="color + ' transparent transparent transparent'">
        <div></div>
        <div></div>
        <div></div>
      </div>
      @if (message) {
        <p class="spinner-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    @import '../../../../../styles.scss';

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: $spacing-4;

      &.size-sm { width: 24px; height: 24px; }
      &.size-md { width: 40px; height: 40px; }
      &.size-lg { width: 64px; height: 64px; }
      &.size-xl { width: 80px; height: 80px; }
    }

    .spinner {
      display: inline-block;
      position: relative;
      width: 100%;
      height: 100%;

      div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        border: 3px solid;
        border-radius: 50%;
        animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: inherit;

        &:nth-child(1) { animation-delay: -0.45s; }
        &:nth-child(2) { animation-delay: -0.3s; }
        &:nth-child(3) { animation-delay: -0.15s; }
      }
    }

    @keyframes spinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner-message {
      font-size: $text-sm;
      color: $text-secondary;
      margin: 0;
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: string = '#3A5689';
  @Input() message?: string;
}
