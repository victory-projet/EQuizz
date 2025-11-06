import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipationChart } from './participation-chart';

describe('ParticipationChart', () => {
  let component: ParticipationChart;
  let fixture: ComponentFixture<ParticipationChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipationChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipationChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
