import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionManagerComponent } from './institution-manager.component';

describe('InstitutionManagerComponent', () => {
  let component: InstitutionManagerComponent;
  let fixture: ComponentFixture<InstitutionManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstitutionManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
