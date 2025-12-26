import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalConfirmationComponent } from './global-confirmation.component';
import { ConfirmationService } from '../../services/confirmation.service';

describe('GlobalConfirmationComponent', () => {
  let component: GlobalConfirmationComponent;
  let fixture: ComponentFixture<GlobalConfirmationComponent>;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalConfirmationComponent],
      providers: [ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalConfirmationComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display dialog when closed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dialog-overlay')).toBeFalsy();
  });

  it('should display dialog when open', () => {
    confirmationService.confirm({ message: 'Test message' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dialog-overlay')).toBeTruthy();
    expect(compiled.textContent).toContain('Test message');
  });

  it('should display close icon', () => {
    confirmationService.confirm({ message: 'Test message' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const closeIcon = compiled.querySelector('.close-btn .material-icons');
    expect(closeIcon).toBeTruthy();
    expect(closeIcon?.textContent?.trim()).toBe('close');
  });

  it('should call onConfirm when confirm button is clicked', () => {
    spyOn(component, 'onConfirm');
    confirmationService.confirm({ message: 'Test message' });
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('.btn-primary');
    confirmButton?.click();

    expect(component.onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    spyOn(component, 'onCancel');
    confirmationService.confirm({ message: 'Test message' });
    fixture.detectChanges();

    const cancelButton = fixture.nativeElement.querySelector('.btn-secondary');
    cancelButton?.click();

    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should apply danger class for danger type', () => {
    confirmationService.confirm({ 
      message: 'Test message',
      type: 'danger'
    });
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('.btn-primary');
    expect(confirmButton?.classList.contains('btn-danger')).toBeTruthy();
  });
});