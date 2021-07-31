import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';
@Injectable({
  providedIn: 'root'
})
export class UsersAppApiService {

  constructor(
    private http: HttpClient,
    private apiconf: ApiConfigService, private handleErrors: CommonAlerts
  ) { }


  getAllUsersApp(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'user/getAll', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  searchUsersApp(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'user/search', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  changeStatus(body: any): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'user/status', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }


}