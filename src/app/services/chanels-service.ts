import { Injectable } from "@angular/core";
import { ApiConfigService } from "./api-config.service";
import { CommonAlerts } from "../Common/common-alerts";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  constructor(
    private http: HttpClient,
    private apiconf: ApiConfigService, private handleErrors: CommonAlerts
  ) { }

  getAllChannels(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'channels/getAll', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  addChannel(body: string): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'channels/add', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  updateStatusChannel(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'channels/status', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  updateChannel(body: string): Observable<any> {
    return this.http.put(this.apiconf.apiUrl + 'channels/update', body, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  deleteChannel(idChannel: string): Observable<any> {
    return this.http.delete(this.apiconf.apiUrl + 'channels/delete?idChannel=' + idChannel, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }


  /* chats */

  getMessagesByIdChannel(idChannel: string): Observable<any> {
    return this.http.get(this.apiconf.apiUrl + 'messages/getMessages?idChannel='+ idChannel, this.apiconf.getHeaders()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }

  uploadFiles(body: any): Observable<any> {
    return this.http.post(this.apiconf.apiUrl + 'messages/uploadFiles', body, this.apiconf.getHeadersImage()).pipe(
      catchError(this.handleErrors.handleError)
    );
  }
}