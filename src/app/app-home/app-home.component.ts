import { Component, ElementRef, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PaymentResponseModel } from 'src/model/payment-response.model';
import { PaymentRequestModel } from 'src/model/payment-request.model';
import { PaymentService } from 'src/service/payment.service';
import { usersData } from 'src/shared/userProfileConst';
import { SignalRService } from 'src/service/signalR-service';
import { DeeplinkService } from 'src/service/deep-link-service';
// import * as $ from "jquery";
import "src/scripts/jquery.applink.js";
import { LocalStorageService } from 'src/service/local-storage-service';

declare let $: any;          

@Component({
  selector: 'app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.css'],
  providers: [DeeplinkService]
})
export class HomeComponent implements OnInit {
   mybtnTxt: string = "Pay";
   appURL: string = "";
   downloadURL: string = "";
   paymentRef: string = "";
   amount: number = 0;
   url: string = "https://pay.connexpointstage.com/v1/payments/new";
   users = usersData;
   pcct = usersData[0].pcct;
   transactionStatus: string ="";

  constructor(private paymentService: PaymentService, 
    private signalRService: SignalRService,
    private deepLinkService: DeeplinkService,
    private elRef:ElementRef,
    private localStorage: LocalStorageService) {
  }

  ngOnInit() {
    console.log(this.localStorage.getItem("signalRstatus"))
    if(true){
      console.log("starting signalR with PCCT:{0}", this.pcct)
      this.startSignalRservice();   
      this.localStorage.setItem("signalRstatus","true");
    }else{
      console.log("connection already opened with PCCT:{0}", this.pcct);
    }
  }

  startSignalRservice(){
    this.signalRService.init(this.pcct);
    this.signalRService.signalInfo.subscribe(data => 
      {
        var mydata = JSON.parse(data);
        if(mydata.Success) {
          this.transactionStatus = "Transaction allocation is successful."
          this.mybtnTxt = "Execute";       
        }
        else{
          this.transactionStatus = "Transaction allocation has failed."
        }
        // console.table(mydata.success);
        // console.table(JSON.parse(mydata.ResponseContent));
      });
  }

  execute(){
      console.log("Execute clicked: Started: {0}",this.mybtnTxt);
      if(this.mybtnTxt == "Pay"){
        this.paymentService.createPaymentRequest(this.amount,this.pcct).subscribe((res: any) => {
          console.log(res); 
          const { paymentID, paymentRef, amount,  } = res;
          this.paymentRef = paymentRef;
          this.openApp();
        });
      }
      else if(this.mybtnTxt == "Execute"){
        this.ExecutePayment();
      }
      console.log("Execute clicked: Exited");
  }

  openApp() {
    let agent = navigator.userAgent.toLowerCase();
    let IS_IPAD = agent.match(/iPad/i) !== null;
    let IS_IPHONE = !IS_IPAD && ((agent.match(/iPhone/i) !== null) || (agent.match(/iPod/i) !== null));
    let IS_IOS = IS_IPAD || IS_IPHONE;
    let IS_ANDROID = !IS_IOS && agent.match(/android/i) !== null;
    if (IS_ANDROID) {
          this.appURL =`intent:#Intent;action=com.vanco.accept;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;S.pcct=${this.pcct};S.isweb=true;S.paymentRef=${this.paymentRef};S.amount=${this.amount};end`;
          this.downloadURL = "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user";
     } 
    else {
          this.appURL= `vancoaccept://checkout?paymentRef=${this.paymentRef}&pcct=${this.pcct}&amount=${this.amount}&isWeb=true`;
          this.downloadURL = "https://apps.apple.com/us/app/id1193357041";
         }
    setTimeout(() => {
          (<any>$('a[data-applink]')).applink();
          let el = this.elRef.nativeElement.querySelector('#link');
          if (el) el.click();
    }, 500)
    
  }

  ExecutePayment(){
    this.paymentService.paymentExecute(this.amount, this.pcct, this.paymentRef).subscribe((res: any)=>{
           console.log(res); 
    });
  }
  
  onChange() {
    console.log("starting signalR with PCCT:{0}", this.pcct)
    this.startSignalRservice();
 }
}