import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';


@Injectable({
  providedIn: 'root'
})
export class WinnersService {

  constructor(private http: HttpClient, private apiconf: ApiConfigService, private handleErrors: CommonAlerts) { }

  //winers tickteo
  getAllWinnersByIdBroadcaster(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'winners/findAll', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  getAllWinnersForShop(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'winners/shop/findById', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  reclaimAward(idWinner: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'winners/award/reclaim?idWinner=' + idWinner, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  //winers direct

  getAllWinnersDirectForShop(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'winnersDirect/shop/findById', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  reclaimAwardDirect(idWinner: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'winnersDirect/award/reclaim?idWinner=' + idWinner, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
}