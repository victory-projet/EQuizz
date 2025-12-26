import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show confirmation dialog', () => {
    const config = {
      message: 'Test message',
      title: 'Test title'
    };

    service.confirm(config);

    expect(service.isOpen()).toBe(true);
    expect(service.config().message).toBe('Test message');
    expect(service.config().title).toBe('Test title');
  });

  it('should resolve with true when confirmed', async () => {
    const config = {
      message: 'Test message'
    };

    const confirmPromise = service.confirm(config);
    service.onConfirm();

    const result = await confirmPromise;
    expect(result).toBe(true);
    expect(service.isOpen()).toBe(false);
  });

  it('should resolve with false when cancelled', async () => {
    const config = {
      message: 'Test message'
    };

    const confirmPromise = service.confirm(config);
    service.onCancel();

    const result = await confirmPromise;
    expect(result).toBe(false);
    expect(service.isOpen()).toBe(false);
  });

  it('should use predefined delete confirmation', async () => {
    const confirmPromise = service.confirmDelete('Test Item');
    
    expect(service.isOpen()).toBe(true);
    expect(service.config().type).toBe('danger');
    expect(service.config().message).toContain('Test Item');
    expect(service.config().confirmText).toBe('Supprimer');
    expect(service.config().icon).toBe('delete_forever');

    service.onCancel();
    const result = await confirmPromise;
    expect(result).toBe(false);
  });

  it('should use predefined publish confirmation', async () => {
    const confirmPromise = service.confirmPublish('Test Evaluation');
    
    expect(service.isOpen()).toBe(true);
    expect(service.config().type).toBe('info');
    expect(service.config().message).toContain('Test Evaluation');
    expect(service.config().confirmText).toBe('Publier');
    expect(service.config().icon).toBe('send');

    service.onConfirm();
    const result = await confirmPromise;
    expect(result).toBe(true);
  });

  it('should use correct icons for different types', () => {
    // Test danger type
    service.confirm({ message: 'Test', type: 'danger' });
    expect(service.config().icon).toBe('warning');

    // Test warning type
    service.confirm({ message: 'Test', type: 'warning' });
    expect(service.config().icon).toBe('error_outline');

    // Test info type
    service.confirm({ message: 'Test', type: 'info' });
    expect(service.config().icon).toBe('info');

    // Test success type
    service.confirm({ message: 'Test', type: 'success' });
    expect(service.config().icon).toBe('check_circle');

    // Test default type
    service.confirm({ message: 'Test', type: 'default' });
    expect(service.config().icon).toBe('help_outline');
  });
});