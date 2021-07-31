import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastersComponent } from './broadcasters.component';

describe('BroadcastersComponent', () => {
  let component: BroadcastersComponent;
  let fixture: ComponentFixture<BroadcastersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
