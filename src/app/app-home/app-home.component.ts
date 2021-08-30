import { Component, ElementRef, OnInit } from '@angular/core';
import { PaymentService } from 'src/service/payment.service';
import { usersData } from 'src/shared/userProfileConst';
import { SignalRService } from 'src/service/signalR-service';
import { DeeplinkService } from 'src/service/deep-link-service';
import "src/scripts/jquery.applink.js";
import { LocalStorageService } from 'src/service/local-storage-service';
import { ActivatedRoute } from '@angular/router';
import { param } from 'jquery';

declare let $: any;          

@Component({
  selector: 'app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.css'],
  providers: [DeeplinkService]
})

export class HomeComponent implements OnInit {
   mybtnTxt: string = "Pay";
   isRedirect : boolean = false;
   appURL: string = "";
   downloadURL: string = "";
   paymentRef: string = "";
   amount: number = 0;
   url: string = "https://pay.connexpointstage.com/v1/payments/new";
   users = usersData;
   pcct = usersData[0].pcct;
   transactionStatus: string ="";
   allocationSuccess: boolean = false;
   vancoPartnerMessage: any = "";
   signalRConnected : boolean = false;
   hostURL : string = window.location.origin; 

  constructor(private paymentService: PaymentService, 
    private signalRService: SignalRService,
    private deepLinkService: DeeplinkService,
    private elRef:ElementRef,
    private localStorage: LocalStorageService,
    private route: ActivatedRoute ) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.allocationSuccess = Boolean(params.get('isSuccess'));
      this.vancoPartnerMessage = params.get('message');
      }
    );
    if(this.allocationSuccess){
      this.amount= Number(this.localStorage.getItem("amount"));
      this.paymentRef = String(this.localStorage.getItem("paymentref"));
      this.pcct = String(this.localStorage.getItem("pcct"));
      this.isRedirect = true;
      this.mybtnTxt = "Execute";   
    }
    else{
    this.signalRConnected = false;
    this.isRedirect = false;
    }
  }

  startSignalRservice(){
    console.log("starting signalR with PCCT:{0}", this.pcct)
    this.signalRService.init(this.pcct);
    this.signalRService.signalInfo.subscribe(data => 
      {
        if(data == "Connected") {
          console.log("SignalR Connected successfully");
          this.signalRConnected = true;
          this.createPaymentRequest();
        }
        else{
          var mydata = JSON.parse(data);
          if(mydata.Success) {
           // this.transactionStatus = "Card Authorization is successful."
            this.mybtnTxt = "Execute";       
          }
          else{
            this.transactionStatus = "Card Authorization has failed."
        }
       }
      });
  }

  execute(){
      console.log("Execute clicked: Started: {0}",this.mybtnTxt);
      if(this.mybtnTxt == "Pay"){
        if(!this.isRedirect && !this.signalRConnected){
          this.startSignalRservice();
        }
        else{
          this.createPaymentRequest();
        }
      }
      else if(this.mybtnTxt == "Execute"){ this.ExecutePayment(); }
      console.log("Execute clicked: Exited");
  }

  createPaymentRequest(){
    this.paymentService.createPaymentRequest(this.amount,this.pcct).subscribe((res: any) => {
      console.log(res); 
      const { paymentID, paymentRef, amount,status, message} = res;
      if(paymentRef == undefined) { this.paymentRef = res;}
      else {this.paymentRef = paymentRef;}
      if(status == "Created" || paymentRef == undefined){
        this.saveValueToLocalStorage();
        this.openApp();
      }
      else{
          this.transactionStatus = message;
      }
    },
      (error) => {                              //Error callback
      console.log(error);
      const {message} = error;
      this.transactionStatus = message;
    });
  }

  openApp() {
    let agent = navigator.userAgent.toLowerCase();
    let IS_IPAD = agent.match(/iPad/i) !== null;
    let IS_IPHONE = !IS_IPAD && ((agent.match(/iPhone/i) !== null) || (agent.match(/iPod/i) !== null));
    let IS_IOS = IS_IPAD || IS_IPHONE;
    let IS_ANDROID = !IS_IOS && agent.match(/android/i) !== null;
    let redirectURL: any = this.isRedirect? this.hostURL + window.location.pathname + "?isSuccess=true&message=yourmessage": null;
    if (IS_ANDROID) {
          this.appURL =`intent:#Intent;action=com.vanco.accept;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;S.pcct=${this.pcct};S.isweb=true;S.paymentRef=${this.paymentRef};S.amount=${this.amount};S.redirectURL=${redirectURL};end`;
          this.downloadURL = "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user";
     } 
    else {
          this.appURL= `vancoaccept://checkout?paymentRef=${this.paymentRef}&pcct=${this.pcct}&amount=${this.amount}&isWeb=true&redirectURL=${redirectURL}`;
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
      const {status, paymentID,message} = res;
      if(status == "Success"){
        this.transactionStatus = "Payment Executed Successfully with Payment ID: "+ paymentID;     
        console.log(res); 
        setTimeout(this.refreshPage,1000)
      }else{
        this.transactionStatus = message;
      }
    },
      (error) => {                              //Error callback
      console.log(error);
      const {message} = error;
      this.transactionStatus = message;
    });
  }
  
  onChange() {
    //this.startSignalRservice();
  }

  refreshPage() {
  this.isRedirect = false;
  this.amount = 0;
  this.localStorage.clear();
  //window.location.replace(this.hostURL);
  }

  saveValueToLocalStorage(){
    this.localStorage.setItem("pcct",this.pcct);
    this.localStorage.setItem("amount",String(this.amount));
    this.localStorage.setItem("paymentref",this.paymentRef);
  }
}