import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopBroadcasterComponent } from './shop-broadcaster.component';

describe('ShopBroadcasterComponent', () => {
  let component: ShopBroadcasterComponent;
  let fixture: ComponentFixture<ShopBroadcasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopBroadcasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopBroadcasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
