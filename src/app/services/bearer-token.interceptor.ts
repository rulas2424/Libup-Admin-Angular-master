import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    //if (this.authService.authToken && this.authService.loggedIn){

    const authReq = req.clone({
      headers: req.headers.set(
        'Authorization', `Bearer ${this.cookieService.get('jwt')}`)
    });
    req = authReq;

    return next.handle(req)
      .do(
        event => this.handleResponse(req, event),
        error => this.handleError(req, error));
  }

  handleResponse(req: HttpRequest<any>, event) {
    if (event instanceof HttpResponse) {
     /*  console.log('Request for ', req.url,
        ' Response Status ', event.status,
        ' With body ', event.body); */
    }
  }

  handleError(req: HttpRequest<any>, err) {
    if (err instanceof HttpErrorResponse) {      
      if (err.status === 401) {
        this.showWarning(err.error.message);
        //this.authService.login = false;    
        this.cookieService.deleteAll();
        this.router.navigate(['/login']);
      }
    }

  }
  constructor(private cookieService: CookieService, private router: Router, private toastr: ToastrService) { }

  showWarning(msg: any) {
    this.toastr.warning(msg, 'Advertencia!', {
      timeOut: 1500
    });
  }
}