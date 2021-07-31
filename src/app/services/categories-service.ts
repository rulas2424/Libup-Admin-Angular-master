import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(
    private http: HttpClient,
    private apiconf: ApiConfigService, private handleErrors: CommonAlerts
  ) { }

  getAllCategories(): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'category/getAll', this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  finndAllCategoriesActives(): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'category/findAllActives', this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  addCategories(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'category/add', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  updateCategories(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'category/update', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  changeStatus(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'category/status', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  //relacionar categorias con comercios

  getAllRelationsByIdShop(idShop: string): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'rCategory/findAll?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  
  saveOrUpdateRelations(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'rCategory/update', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

}