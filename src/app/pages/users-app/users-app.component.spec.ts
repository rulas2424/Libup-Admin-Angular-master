import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAppComponent } from './users-app.component';

describe('UsersAppComponent', () => {
  let component: UsersAppComponent;
  let fixture: ComponentFixture<UsersAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
