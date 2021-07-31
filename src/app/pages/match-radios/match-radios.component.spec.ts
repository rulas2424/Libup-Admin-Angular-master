import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchRadiosComponent } from './match-radios.component';

describe('MatchRadiosComponent', () => {
  let component: MatchRadiosComponent;
  let fixture: ComponentFixture<MatchRadiosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchRadiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchRadiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
