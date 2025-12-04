import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LazyImageDirective } from './lazy-image.directive';

@Component({
  template: `
    <img [appLazyImage]="imageUrl" 
         [placeholder]="placeholderUrl" 
         alt="Test image">
  `,
  standalone: true,
  imports: [LazyImageDirective]
})
class TestComponent {
  imageUrl = 'https://example.com/image.jpg';
  placeholderUrl = 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E';
}

describe('LazyImageDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let imgElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, LazyImageDirective]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    imgElement = fixture.debugElement.query(By.css('img'));
  });

  it('should create an instance', () => {
    expect(imgElement).toBeTruthy();
  });

  it('should set placeholder initially', () => {
    fixture.detectChanges();
    const img = imgElement.nativeElement as HTMLImageElement;
    expect(img.src).toContain('data:image/svg+xml');
  });

  it('should add lazy-loading class initially', () => {
    fixture.detectChanges();
    const img = imgElement.nativeElement as HTMLImageElement;
    expect(img.classList.contains('lazy-loading')).toBe(true);
  });

  it('should handle missing image URL gracefully', () => {
    component.imageUrl = '';
    fixture.detectChanges();
    const img = imgElement.nativeElement as HTMLImageElement;
    expect(img.src).toContain('data:image/svg+xml');
  });
});
