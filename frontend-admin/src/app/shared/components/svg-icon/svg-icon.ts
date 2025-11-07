// src/app/shared/components/svg-icon/svg-icon.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg-icon',
  standalone: true,
  template: `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <use [attr.href]="'assets/icons.svg#' + name"></use>
    </svg>
  `,
  styles: [`
    :host { display: inline-block; }
    svg { width: 1.25rem; height: 1.25rem; }
  `]
})
export class SvgIconComponent {
  @Input({ required: true }) name!: string;
}