import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizStatsComponent } from './quiz-stats';

describe('QuizStatsComponent', () => {
  let component: QuizStatsComponent;
  let fixture: ComponentFixture<QuizStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
