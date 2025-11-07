import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | number, format: 'short' | 'long' | 'relative' | 'time' = 'short'): string {
    if (!value) return '';

    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    switch (format) {
      case 'short':
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

      case 'long':
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

      case 'time':
        return date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });

      case 'relative':
        return this.getRelativeTime(date);

      default:
        return date.toLocaleDateString('fr-FR');
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'À l\'instant';
    } else if (diffMin < 60) {
      return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    } else if (diffHour < 24) {
      return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
    } else if (diffDay < 7) {
      return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
    } else if (diffDay < 30) {
      const weeks = Math.floor(diffDay / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else if (diffDay < 365) {
      const months = Math.floor(diffDay / 30);
      return `Il y a ${months} mois`;
    } else {
      const years = Math.floor(diffDay / 365);
      return `Il y a ${years} an${years > 1 ? 's' : ''}`;
    }
  }
}
