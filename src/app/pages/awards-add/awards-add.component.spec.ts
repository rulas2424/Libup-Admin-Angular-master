import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardsAddComponent } from './awards-add.component';

describe('AwardsAddComponent', () => {
  let component: AwardsAddComponent;
  let fixture: ComponentFixture<AwardsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
