import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MenuItems } from '../../../shared/menu-items/menu-items';
import { CookieService } from 'ngx-cookie-service';
import { ApiConfigService } from '../../../services/api-config.service';
import { EncrDecrService } from '../../../classes/EncrDecrService';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class AppSidebarComponent implements OnDestroy, OnInit {
  rol: string;
  commerce: string = "Comercios";
  ngOnInit(): void {
    this.rol = this.cookieService.get("rol");
    if (this.rol == "Comercio") {
      this.commerce = "Comercio "
    } else if (this.rol == "SuperAdmin") {
      this.commerce = "Comercios"
    }
  }
  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public cookieService: CookieService,
    private apiConf: ApiConfigService,  private EncrDecr: EncrDecrService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  decriptValue(){
    var decrypted = this.EncrDecr.get(this.apiConf.encript, this.cookieService.get('rol').toString());  
    return decrypted.toString();
  }
}
