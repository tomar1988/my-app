import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaymentResponseModel } from 'src/model/payment-response.model';
import { PaymentRequestModel } from 'src/model/payment-request.model';

@Injectable({
  providedIn: 'root'
})

export class PaymentService {
  url: string = "https://pay.connexpointstage.com/v2/payments/new"
  mxChipData: Subject<string> = new Subject();
  constructor(private http: HttpClient) {
  }

  public createPaymentRequest(amount: number, pcct: string) {
    const httpOptions = {
      headers : new HttpHeaders({
        'Accept':'application/json',
        'Content-Type':  'application/json',
        'Authorization':'Bearer iGSagz8o7sRZV2jT8BKpCz79OkVm1sVEOGwcYJyVO3g',
        'PCCT':pcct,
        //'Host':'pay.connexpointstage.com',
        'Access-Control-Allow-Origin': '*'
      })
    }
     const requestPayload = this.getPaymentRequestBody(amount);
    console.log(requestPayload);
    return this.http.post(this.url, requestPayload, httpOptions).pipe(catchError(this.handleError));
  }
   
  private getPaymentRequestBody(amount: number) : PaymentRequestModel{
    return new PaymentRequestModel(amount);
  }

  public paymentExecute(amount: number, pcct: string, paymentRef: string){
    const httpOptions = {
      headers : new HttpHeaders({
        'Accept':'application/json',
        'Content-Type':  'application/json',
        'Authorization':'Bearer iGSagz8o7sRZV2jT8BKpCz79OkVm1sVEOGwcYJyVO3g',
        'PCCT':pcct,
        'Access-Control-Allow-Origin': '*'
      })
    }
    var executeURL = `https://pay.connexpointstage.com/v1/payments/${paymentRef}/execute`
    const requestPayload = {"amount":amount}
    return this.http.post(this.url, requestPayload, httpOptions).pipe(catchError(this.handleError));
  }


  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
 }

