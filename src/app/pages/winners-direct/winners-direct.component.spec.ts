import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersDirectComponent } from './winners-direct.component';

describe('WinnersDirectComponent', () => {
  let component: WinnersDirectComponent;
  let fixture: ComponentFixture<WinnersDirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinnersDirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinnersDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
