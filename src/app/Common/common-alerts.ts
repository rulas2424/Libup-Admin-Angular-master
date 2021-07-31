import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
@Injectable()
export class CommonAlerts {
  constructor(private cookieService: CookieService, private _snackBar: MatSnackBar) { }
  showToastError(message: string) {
    if (this.cookieService.check('isLogin')) {
      this._snackBar.open(message, "Ok", {
        duration: 2500,
        panelClass: ['snackbarerror']
      });
    }
  }

  showSuccess(msg: any) {
    if (this.cookieService.check('isLogin')) {
      this._snackBar.open(msg, "Ok", {
        duration: 1500,
        panelClass: ['snackbarsuccess']
      });
    }
  }

  showWarnning(message: string) {
    if (this.cookieService.check('isLogin')) {
      this._snackBar.open(message, "Ok", {
        duration: 1500,
        panelClass: ['snackbarwarn']
      });
    }
  }

  handleError(error) {
    let errorMessage = '';    
    if (error instanceof HttpErrorResponse) {      
      if (error.status !== 401) {
          if(error.error.header === undefined){                    
            errorMessage = "Error interno: " + error.message;
            return throwError(errorMessage)
          } else{            
            errorMessage = error.error.header.message;
            return throwError(errorMessage);
          }        
      }
    }
    if (error.error instanceof ErrorEvent) {
      // client-side error      
      errorMessage = `Error: ${error.error.message}`;
      return throwError(errorMessage);
    }  
  }
}