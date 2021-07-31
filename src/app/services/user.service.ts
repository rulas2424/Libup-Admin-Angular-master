import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private apiconf: ApiConfigService, private handleErrors: CommonAlerts) { }

  loginUser(user: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'userAdmin/login', user, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getAllAdmins(body: string) {
    return this.http.post(this.apiconf.apiUrl + 'userAdmin/getAll', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  
  getAdminById(idAdmin: string) {
    return this.http.get(this.apiconf.apiUrl + 'userAdmin/getById?idAdmin=' + idAdmin, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }



  addUsersAdmin(body: string) {
    return this.http.post(this.apiconf.apiUrl + 'userAdmin/add', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }


  updateUsersAdmin(body: string) {
    return this.http.put(this.apiconf.apiUrl + 'userAdmin/update', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  changeStatus(body: string) {
    return this.http.put(this.apiconf.apiUrl + 'userAdmin/status', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  changePassword(body: string) {
    return this.http.put(this.apiconf.apiUrl + 'userAdmin/changePassword', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  updatePassword(body: string) {
    return this.http.put(this.apiconf.apiUrl + 'userAdmin/updatePassword', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }



  searchUsers(body: string) {
    return this.http.post(this.apiconf.apiUrl + 'userAdmin/search', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
    
  //planes y validacion
  verifyPlan(idShop: string) {
    return this.http.get(this.apiconf.apiUrl + 'userAdmin/verifyPlan?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
  
}
