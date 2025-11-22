// src/app/presentation/shared/components/svg-icon/svg-icon.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, icons } from 'lucide-angular';
import { lucideIcons } from '../../../../config/lucide-icons.config';

/**
 * Composant d'icône SVG unifié utilisant Lucide Icons
 * 
 * Usage:
 * <app-svg-icon name="home" [size]="24" color="#3A5689" />
 * <app-svg-icon name="user" size="lg" />
 */
@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <lucide-icon 
      [name]="name" 
      [size]="getSize()"
      [color]="color"
      [strokeWidth]="strokeWidth"
      [class]="className"
    />
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    lucide-icon {
      display: flex;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent {
  @Input() name: keyof typeof lucideIcons = 'Circle';
  @Input() size: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color?: string;
  @Input() strokeWidth: number = 2;
  @Input() className?: string;

  getSize(): number {
    if (typeof this.size === 'number') {
      return this.size;
    }

    const sizeMap = {
      'xs': 16,
      'sm': 20,
      'md': 24,
      'lg': 32,
      'xl': 40
    };

    return sizeMap[this.size] || 24;
  }
}
