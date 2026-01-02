import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evaluation-submissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-submissions.component.html',
  styleUrls: ['./evaluation-submissions.component.scss']
})
export class EvaluationSubmissionsComponent implements OnInit {
  evaluationId: string | null = null;
  submissions: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.evaluationId = this.route.snapshot.paramMap.get('id');
    this.loadSubmissions();
  }

  private loadSubmissions(): void {
    this.loading = true;
    // TODO: Implement submission loading logic
    console.log('Loading submissions for evaluation:', this.evaluationId);
    this.loading = false;
  }
}