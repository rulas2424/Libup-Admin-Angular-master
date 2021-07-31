import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { CommonAlerts } from "../Common/common-alerts";
import { ApiConfigService } from "./api-config.service";

@Injectable({
  providedIn: 'root'
})
export class BroadcasterService {
  constructor(
    private http: HttpClient,
    private apiconf: ApiConfigService, private handleErrors: CommonAlerts
  ) { }



  getAllBroadcasters(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'broadcaster/getAll', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getAllBroadcastersActives(): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'broadcaster/getAllActives', this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  addBroadcaster(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'broadcaster/add', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  updateBroadcaster(body: any): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'broadcaster/update', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  searchBroadcaster(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'broadcaster/search', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  changeStatusBroadcaster(body: any): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'broadcaster/status', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  /* relaciones de comercios a radios */

  getAllRelationBroadcasterShop(idShop: any): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'radios/shop/getRelations?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  deleteRelationBroadcasterShop(idRelation: any): Observable<any> {
    return this.http.delete(this.apiconf.apiUrl + 'radios/shop/delete?idRelation=' + idRelation, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  addRelationBroadcasterShop(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'radios/shop/add', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getAllRelationBroadcasterShopActives(idShop: any): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'radios/shop/getRelationsActives?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getRelationsByIdBroadcaster(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'radios/shop/getRelationsByIdBroadcaster', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  addOrRemoveContrato(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'radios/shop/updateContract', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
  /* relaciones de comercios a radios */
}  