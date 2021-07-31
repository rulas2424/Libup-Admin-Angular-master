import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';
@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  constructor(
    private http: HttpClient,
    private apiconf: ApiConfigService, private handleErrors: CommonAlerts
  ) { }

  filterPromotionsForShop(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/getPromosForShop', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
  
  changeStatusPromo(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'promo/status', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  addPromotion(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/add', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  updtatePromotion(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'promo/update', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getAwardsForIdShop(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/getAwards', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getAwardsWithAudioForIdShop(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/getAwardsAudio', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getPromosOrDiscountsForIdShop(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/getPromosOrDiscounts', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  deletePromo(idPromo: string): Observable<any> {
    return this.http.delete(this.apiconf.apiUrl + 'promo/delete?idPromo=' + idPromo, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getHouSystem(): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'promo/getTime', this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getPromosOrDiscountsActivesForIdShop(idShop: string): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'promo/getPromosOrDiscountsActives?idShop=' + idShop, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  //notifications

  sendNotificationWinnerDirect(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/notificate/winnerDirect', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  sendNotificationPromoOrDiscounts(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'promo/notificator', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
}