import { MediaMatcher } from '@angular/cdk/layout';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { EncrDecrService } from '../../classes/EncrDecrService';
import { ApiConfigService } from '../../services/api-config.service';

/** @title Responsive sidenav */
@Component({
  selector: 'app-full-layout',
  templateUrl: 'full.component.html',
  styleUrls: []
})
export class FullComponent implements OnDestroy, AfterViewInit {

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  //private message = 'LUL';
  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,private router: Router, public cookieService: CookieService, private EncrDecr: EncrDecrService, 
    private apiconf: ApiConfigService
  ) {
    
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);   
    //this.message = String(authService.loggedIn);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);    
  }
  ngAfterViewInit() {}

  decriptValue(){
    var decrypted = this.EncrDecr.get(this.apiconf.encript, this.cookieService.get('rol').toString());  
    return decrypted.toString();
  }
}
