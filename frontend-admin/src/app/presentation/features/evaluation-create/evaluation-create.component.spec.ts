import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EvaluationCreateComponent } from './evaluation-create.component';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { of } from 'rxjs';

describe('EvaluationCreateComponent - Modal Selection', () => {
  let component: EvaluationCreateComponent;
  let fixture: ComponentFixture<EvaluationCreateComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockEvaluationUseCase: jasmine.SpyObj<EvaluationUseCase>;
  let mockAcademicUseCase: jasmine.SpyObj<AcademicUseCase>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const evaluationUseCaseSpy = jasmine.createSpyObj('EvaluationUseCase', ['createEvaluation', 'updateEvaluation']);
    const academicUseCaseSpy = jasmine.createSpyObj('AcademicUseCase', ['getCours', 'getClasses']);

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
    mockAcademicUseCase.getClasses.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show method modal when showMethodModal is true', () => {
    component.showMethodModal.set(true);
    fixture.detectChanges();
    
    const modalElement = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modalElement).toBeTruthy();
  });

  it('should hide method modal when showMethodModal is false', () => {
    component.showMethodModal.set(false);
    fixture.detectChanges();
    
    const modalElement = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modalElement).toBeFalsy();
  });

  it('should navigate to manual creation when selectManualCreation is called', () => {
    const evaluationId = 'test-id';
    component.createdEvaluationId.set(evaluationId);
    
    component.selectManualCreation();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/evaluations', evaluationId, 'questions'],
      { queryParams: { mode: 'manual' } }
    );
    expect(component.showMethodModal()).toBeFalse();
  });

  it('should navigate to Excel import when selectExcelImport is called', () => {
    const evaluationId = 'test-id';
    component.createdEvaluationId.set(evaluationId);
    
    component.selectExcelImport();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/evaluations', evaluationId, 'import'],
      { queryParams: { mode: 'excel' } }
    );
    expect(component.showMethodModal()).toBeFalse();
  });

  it('should close modal when closeMethodModal is called', () => {
    component.showMethodModal.set(true);
    
    component.closeMethodModal();
    
    expect(component.showMethodModal()).toBeFalse();
  });

  it('should display both method options in the modal', () => {
    component.showMethodModal.set(true);
    fixture.detectChanges();
    
    const manualCard = fixture.nativeElement.querySelector('.manual-creation');
    const excelCard = fixture.nativeElement.querySelector('.excel-import');
    
    expect(manualCard).toBeTruthy();
    expect(excelCard).toBeTruthy();
    
    // Check for specific content
    expect(manualCard.textContent).toContain('Création Manuelle');
    expect(excelCard.textContent).toContain('Import Excel');
  });
});