import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

// Imports animations corrects
import { trigger, transition, style, animate } from '@angular/animations';

interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  periods: Period[];
  semesters: Period[]; // Alias pour periods
}

interface Period {
  id: string;
  name: string;
  type: 'semester' | 'trimester';
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-academic-year',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule
  ],
  templateUrl: './academic-year.component.html',
  styleUrls: ['./academic-year.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AcademicYearComponent implements OnInit {
  // ... le reste de votre code reste identique
  academicYears: AcademicYear[] = [];
  currentYear: AcademicYear | null = null;

  ngOnInit(): void {
    this.loadAcademicYears();
  }

  loadAcademicYears(): void {
    // Mock data
    const periods1 = [
      {
        id: '1',
        name: 'Semestre 1',
        type: 'semester' as const,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31')
      },
      {
        id: '2',
        name: 'Semestre 2',
        type: 'semester' as const,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30')
      }
    ];

    this.academicYears = [
      {
        id: '1',
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isActive: true,
        periods: periods1,
        semesters: periods1
      },
      {
        id: '2',
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        isActive: false,
        periods: [],
        semesters: []
      }
    ];

    this.currentYear = this.academicYears.find(y => y.isActive) || null;
  }

  toggleActive(year: AcademicYear): void {
    // Désactiver toutes les autres années
    this.academicYears.forEach(y => y.isActive = false);
    year.isActive = true;
    this.currentYear = year;
  }

  addYear(): void {
    console.log('Add academic year');
  }

  editYear(year: AcademicYear): void {
    console.log('Edit year', year);
  }

  deleteYear(year: AcademicYear): void {
    console.log('Delete year', year);
  }

  addPeriod(year: AcademicYear): void {
    console.log('Add period to', year);
  }

  addSemester(year: AcademicYear): void {
    console.log('Add semester to', year);
  }
}