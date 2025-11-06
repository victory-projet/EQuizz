import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizEditorComponent } from './quiz-editor';

describe('QuizEditorComponent', () => {
  let component: QuizEditorComponent;
  let fixture: ComponentFixture<QuizEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
