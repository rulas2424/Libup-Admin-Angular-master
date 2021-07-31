import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';
@Injectable({
  providedIn: 'root'
})
export class LlamadasApiService {

  constructor(
    private http: HttpClient,
    private apiconf: ApiConfigService, private handleErrors: CommonAlerts
  ) { }

  getAllComercios(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'commerce/getAll', body, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );  
  }

  getAllComerciosActives(): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'commerce/findAll', this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );  
  }

  getCommercesWithContrato(idBroadcaster: any): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'radios/shop/getRelationsActivesByIdBroadcaster?idBroadcaster=' + idBroadcaster, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );  
  }

  
  getCommerceById(idShop: string): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'commerce/getById?id_shop=' + idShop, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );  
  }


  getAllShopsSelect(): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'commerce/shops', this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );  
  }

  addCommerce(body: any): Observable<any>{
    return this.http.post(this.apiconf.apiUrl + 'commerce/add', body, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );
  }  
  
  searchCommerces(body: any): Observable<any>{
    return this.http.post(this.apiconf.apiUrl + 'commerce/search', body, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );
  }

  updateCommerce(body: any): Observable<any>{
    return this.http.put(this.apiconf.apiUrl + 'commerce/update', body, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );
  }
  changeStatusCommerce(body: any): Observable<any>{
    return this.http.put(this.apiconf.apiUrl + 'commerce/status', body, this.apiconf.getHeaders()).pipe(          
      catchError(this.handleErrors.handleError)
    );
  }


}
