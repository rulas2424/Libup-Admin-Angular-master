import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { catchError } from 'rxjs/operators';
import { CommonAlerts } from '../Common/common-alerts';
@Injectable({
    providedIn: 'root'
})
export class ContestApiService {
    constructor(
        private http: HttpClient,
        private apiconf: ApiConfigService, private handleErrors: CommonAlerts
    ) { }

    uploadAudioAndContest(formData: any): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/upload', formData).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    createContestSinAudio(body: any): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/createContest', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    changeStatusContest(body: any): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/status', body).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    updateAudioAndContest(formData: any): Observable<any> {
        return this.http.put(this.apiconf.apiUrl + 'acrCloud/audios/update', formData).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    getContestList(body: string): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/getList', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    getContestListByShop(body: string): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/getListByShop', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }

    terminateContest(body: string): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/contest/terminate', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }


    /* notificate user */
    notificateUsers(body: any): Observable<any> {
        return this.http.post(this.apiconf.apiUrl + 'acrCloud/audios/notifications', body, this.apiconf.getHeaders()).pipe(
            catchError(this.handleErrors.handleError)
        );
    }
}