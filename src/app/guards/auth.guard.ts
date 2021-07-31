import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { EncrDecrService } from '../classes/EncrDecrService';
import { ApiConfigService } from '../services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private cookieService: CookieService, private router: Router, private EncrDecr: EncrDecrService, private apiConf: ApiConfigService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    var decrypted = this.EncrDecr.get(this.apiConf.encript, this.cookieService.get('rol').toString());  
    const currentUser = decrypted;
      // check if route is restricted by role
      if (!this.cookieService.check('isLogin') || (route.data.expectedRol && route.data.expectedRol.indexOf(currentUser) === -1)) {
        // role not authorised so redirect to home page
        this.router.navigate(['/']);
        return false;
      }

      // authorised so return true
      return true;

  }
}
