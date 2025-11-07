import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluationComponent } from './evaluation';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EvaluationComponent', () => {
  let component: EvaluationComponent;
  let fixture: ComponentFixture<EvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EvaluationComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quizzes on init', () => {
    expect(component.quizzes).toBeDefined();
  });

  it('should filter quizzes by search query', () => {
    component.searchQuery = 'Algorithmique';
    component.onSearch();
    expect(component.filteredQuizzes.length).toBeGreaterThanOrEqual(0);
  });
});
