import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestDirectComponent } from './contest-direct.component';

describe('ContestDirectComponent', () => {
  let component: ContestDirectComponent;
  let fixture: ComponentFixture<ContestDirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestDirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
