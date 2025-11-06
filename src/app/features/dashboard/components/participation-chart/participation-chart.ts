import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { 
  Chart, 
  ChartConfiguration, 
  LineElement, 
  PointElement, 
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-participation-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="card chart-card line-chart-card">
      <div class="chart-header">
        <h2>Taux de participation</h2>
        <button class="year-select">Cette année 🔽</button>
      </div>
      
      <div class="chart-container">
        <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="'line'">
        </canvas>
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

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-header h2 {
      font-size: 1.2em;
      font-weight: 600;
      margin: 0;
    }

    .year-select {
      background-color: #e8eaf6;
      color: #3f51b5;
      border: none;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.85em;
      cursor: pointer;
    }

    .year-select:hover {
      background-color: #c5cae9;
    }

    .chart-container {
      position: relative;
      height: 250px;
    }
  `]
})
export class ParticipationChartComponent implements OnInit {
  @Input() data: any;

  lineChartData: ChartConfiguration['data'] = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
    datasets: [
      {
        label: 'Target',
        data: [80, 80, 80, 80, 80],
        borderColor: '#999',
        backgroundColor: 'transparent',
        borderDash: [5, 5]
      },
      {
        label: 'Fin Semestre (%)',
        data: [45, 55, 60, 70, 75],
        borderColor: '#e57373',
        backgroundColor: 'rgba(229, 115, 115, 0.1)',
        tension: 0.4
      },
      {
        label: 'Fin parcours (%)',
        data: [50, 60, 65, 75, 80],
        borderColor: '#64b5f6',
        backgroundColor: 'rgba(100, 181, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  ngOnInit(): void {
    if (this.data) {
      this.lineChartData = this.data;
    }
  }
}
