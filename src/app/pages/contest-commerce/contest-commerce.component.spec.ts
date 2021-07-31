import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestCommerceComponent } from './contest-commerce.component';

describe('ContestCommerceComponent', () => {
  let component: ContestCommerceComponent;
  let fixture: ComponentFixture<ContestCommerceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestCommerceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestCommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
