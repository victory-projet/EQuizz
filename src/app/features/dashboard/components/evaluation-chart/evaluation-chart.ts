import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

@Component({
  selector: 'app-evaluation-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="card chart-card donut-chart-card">
      <h2>Répartition des évaluations</h2>
      
      <div class="chart-content">
        <div class="chart-container">
          <canvas baseChart
                  [data]="doughnutChartData"
                  [options]="doughnutChartOptions"
                  [type]="'doughnut'">
          </canvas>
        </div>
        
        <ul class="legend">
          <li>
            <span class="legend-color completed"></span>
            Completed
          </li>
          <li>
            <span class="legend-color on-hold"></span>
            On Hold
          </li>
          <li>
            <span class="legend-color in-progress"></span>
            In Progress
          </li>
          <li>
            <span class="legend-color pending"></span>
            Pending
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .card h2 {
      font-size: 1.2em;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .chart-content {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 30px;
    }

    .chart-container {
      width: 200px;
      height: 200px;
    }

    .legend {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .legend li {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 0.9em;
      color: #666;
    }

    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .legend-color.completed {
      background-color: #4CAF50;
    }

    .legend-color.on-hold {
      background-color: #03A9F4;
    }

    .legend-color.in-progress {
      background-color: #9C27B0;
    }

    .legend-color.pending {
      background-color: #F44336;
    }
  `]
})
export class EvaluationChartComponent implements OnInit {
  @Input() data: any;

  doughnutChartData: ChartConfiguration['data'] = {
    labels: ['Completed', 'On Hold', 'In Progress', 'Pending'],
    datasets: [{
      data: [32, 25, 25, 18],
      backgroundColor: ['#4CAF50', '#03A9F4', '#9C27B0', '#F44336']
    }]
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  ngOnInit(): void {
    if (this.data) {
      this.doughnutChartData = this.data;
    }
  }
}
