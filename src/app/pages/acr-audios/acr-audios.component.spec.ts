import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcrAudiosComponent } from './acr-audios.component';

describe('AcrAudiosComponent', () => {
  let component: AcrAudiosComponent;
  let fixture: ComponentFixture<AcrAudiosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcrAudiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcrAudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
