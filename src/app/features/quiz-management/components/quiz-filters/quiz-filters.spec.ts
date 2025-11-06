import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizFiltersComponent } from './quiz-filters';

describe('QuizFiltersComponent', () => {
  let component: QuizFiltersComponent;
  let fixture: ComponentFixture<QuizFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
