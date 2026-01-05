import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EvaluationCreateComponent } from './evaluation-create.component';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { of } from 'rxjs';

describe('EvaluationCreateComponent', () => {
  let component: EvaluationCreateComponent;
  let fixture: ComponentFixture<EvaluationCreateComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockEvaluationUseCase: jasmine.SpyObj<EvaluationUseCase>;
  let mockAcademicUseCase: jasmine.SpyObj<AcademicUseCase>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const evaluationUseCaseSpy = jasmine.createSpyObj('EvaluationUseCase', [
      'createEvaluation', 
      'updateEvaluation', 
      'getQuestionsByQuizz',
      'deleteQuestion',
      'createQuestion',
      'publishEvaluation'
    ]);
    const academicUseCaseSpy = jasmine.createSpyObj('AcademicUseCase', ['getCours', 'getAllClasses']);

    await TestBed.configureTestingModule({
      imports: [EvaluationCreateComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: EvaluationUseCase, useValue: evaluationUseCaseSpy },
        { provide: AcademicUseCase, useValue: academicUseCaseSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationCreateComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockEvaluationUseCase = TestBed.inject(EvaluationUseCase) as jasmine.SpyObj<EvaluationUseCase>;
    mockAcademicUseCase = TestBed.inject(AcademicUseCase) as jasmine.SpyObj<AcademicUseCase>;

    // Setup default mocks
    mockAcademicUseCase.getCours.and.returnValue(of([]));
    mockAcademicUseCase.getAllClasses.and.returnValue(of([]));
    mockEvaluationUseCase.getQuestionsByQuizz.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with step 1', () => {
    expect(component.currentStep()).toBe(1);
  });

  it('should load cours and classes on init', () => {
    component.ngOnInit();
    
    expect(mockAcademicUseCase.getCours).toHaveBeenCalled();
    expect(mockAcademicUseCase.getAllClasses).toHaveBeenCalled();
  });

  it('should validate step 1 form data', () => {
    // Invalid form - missing title
    component.formData.titre = '';
    expect(component.validateStep1()).toBeFalse();
    expect(component.errorMessage()).toContain('titre');

    // Invalid form - missing cours
    component.formData.titre = 'Test Title';
    component.formData.coursId = '';
    expect(component.validateStep1()).toBeFalse();
    expect(component.errorMessage()).toContain('cours');

    // Invalid form - missing classes
    component.formData.coursId = '1';
    component.formData.classeIds = [];
    expect(component.validateStep1()).toBeFalse();
    expect(component.errorMessage()).toContain('classe');

    // Valid form
    component.formData.classeIds = ['1'];
    expect(component.validateStep1()).toBeTruthy();
  });

  it('should navigate to next step when form is valid', () => {
    // Setup valid form data
    component.formData.titre = 'Test Evaluation';
    component.formData.coursId = '1';
    component.formData.classeIds = ['1'];
    component.formData.dateDebut = '2024-01-01';
    component.formData.dateFin = '2024-01-31';

    mockEvaluationUseCase.createEvaluation.and.returnValue(of({
      id: 'test-id',
      quizz: { id: 'quiz-id' }
    } as any));

    component.nextStep();

    expect(mockEvaluationUseCase.createEvaluation).toHaveBeenCalled();
  });

  it('should go to previous step', () => {
    component.currentStep.set(2);
    component.prevStep();
    expect(component.currentStep()).toBe(1);

    // Should not go below step 1
    component.prevStep();
    expect(component.currentStep()).toBe(1);
  });

  it('should open question form', () => {
    component.openQuestionForm();
    expect(component.showQuestionForm()).toBeTruthy();
    expect(component.editingQuestion()).toBeNull();
  });

  it('should open question import', () => {
    component.openQuestionImport();
    expect(component.showQuestionImport()).toBeTruthy();
  });

  it('should navigate to evaluations list', () => {
    component.goToEvaluations();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/evaluations']);
  });

  it('should navigate to evaluation detail when ID is available', () => {
    const evaluationId = 'test-id';
    component.createdEvaluationId.set(evaluationId);
    
    component.goToEvaluationDetail();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/evaluations', evaluationId]);
  });

  it('should handle question form cancellation', () => {
    component.showQuestionForm.set(true);
    component.editingQuestion.set({} as any);
    
    component.onQuestionFormCancelled();
    
    expect(component.showQuestionForm()).toBeFalsy();
    expect(component.editingQuestion()).toBeNull();
  });

  it('should handle question import cancellation', () => {
    component.showQuestionImport.set(true);
    
    component.onQuestionImportCancelled();
    
    expect(component.showQuestionImport()).toBeFalsy();
  });
});