import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';
@Injectable({
    providedIn: 'root'
})
export class SucursalesService {
    constructor(
        private http: HttpClient,
        private apiconf: ApiConfigService, private handleErrors: CommonAlerts
    ) { }

    getAllBranches(idShop: String): Observable<any> {
        return this.http.get(this.apiconf.apiUrl + 'branch/getAll?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    addBranch(body: any): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'branch/add', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }
    updateBranch(body: any): Observable<any> {
        return this.http.put(this.apiconf.apiUrl + 'branch/update', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }
    changeStatusBranch(body: any): Observable<any> {
        return this.http.put(this.apiconf.apiUrl + 'branch/status', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    deleteBranch(idBranch: any): Observable<any> {
        return this.http.delete(this.apiconf.apiUrl + 'branch/delete?idBranch=' + idBranch, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    addOrUpdateSchedule(body: any): Observable<any> {
        return this.http.put(this.apiconf.apiUrl + 'schedule/update', body, this.apiconf.getHeaders()).pipe(
          catchError(this.handleErrors.handleError)
      );
    }

    getAllBranchesActives(idShop: String): Observable<any> {
        return this.http.get(this.apiconf.apiUrl + 'branch/findAll?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    getAllStates(): Observable<any> {
        return this.http.get(this.apiconf.apiUrl + 'states/get', this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }
  }
