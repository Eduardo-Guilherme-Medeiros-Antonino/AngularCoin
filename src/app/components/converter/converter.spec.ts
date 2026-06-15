import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Converter } from './converter';

describe('Converter', () => {
  let component: Converter;
  let fixture: ComponentFixture<Converter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Converter],
    }).compileComponents();

    fixture = TestBed.createComponent(Converter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
