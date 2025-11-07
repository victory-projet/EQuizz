import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss']
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'list' | 'table' | 'text' = 'card';
  @Input() count: number = 3;
  @Input() height: string = '100px';

  get items(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}
