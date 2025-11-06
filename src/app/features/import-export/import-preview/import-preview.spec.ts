import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPreview } from './import-preview';

describe('ImportPreview', () => {
  let component: ImportPreview;
  let fixture: ComponentFixture<ImportPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
