import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { SignalRConnection } from '../model/signal-r-connection.model';
import * as SignalR from '@aspnet/signalr';

@Injectable({
  providedIn: 'root'
})

export class SignalRService {
  signalInfo: Subject<string> = new Subject();
  private hubConnection: SignalR.HubConnection | undefined;

  constructor(private http: HttpClient) {
  }

  private getSignalRConnection(): Observable<SignalRConnection> {
    return this.http.get<SignalRConnection>('https://mrbuttons.connexpointstage.com/api/negotiate');
  }

  init(pcct: string) {
    this.getSignalRConnection().subscribe(con => {
      const options = {
        accessTokenFactory: () => con.accessToken
      };

      this.hubConnection = new SignalR.HubConnectionBuilder()
        .withUrl(con.url, options)
        .configureLogging(SignalR.LogLevel.Information)
        .build();

      this.hubConnection.on(pcct, data => {
        //this data has to be passed to the UI Data Controls
        console.log(`recieved Dat: ${data}`);
        this.signalInfo.next(data);
      });

      this.hubConnection.start()
        .then(() => this.signalInfo.next('Connected'))
        .catch((error: string) => alert(error));
     
      this.hubConnection.serverTimeoutInMilliseconds = 300000;

      this.hubConnection.onclose((error) => {
        if (this.hubConnection != undefined) this.hubConnection.start();
        console.error(`Something went wrong: ${error}`);
      });

    });
  }
}
