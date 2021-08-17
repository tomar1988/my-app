import { Injectable } from "@angular/core";


@Injectable()
export class DeeplinkService {
 constructor() {}

 deeplink(paymentRef: string, amount: number, pcct: string) {
   let agent = navigator.userAgent.toLowerCase();
   let IS_IPAD = agent.match(/iPad/i) !== null;
   let IS_IPHONE = !IS_IPAD && ((agent.match(/iPhone/i) !== null) || (agent.match(/iPod/i) !== null));
   let IS_IOS = IS_IPAD || IS_IPHONE;
   let IS_ANDROID = !IS_IOS && agent.match(/android/i) !== null;
   if (IS_ANDROID) {
        let app = { 
          launchApp: function() {
          window.location.href =`intent:#Intent;action=com.vanco.accept;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;S.pcct=${pcct};S.isweb=true;S.paymentRef=${paymentRef};S.amount=${amount};end`;
          },
          openWebApp: function() {
            window.location.href = "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user";
         }              
       };
      app.launchApp();
    } 
 else if (IS_IOS) {
        let app = {   
          launchApp: function() {
          window.location.href = `vancoaccept://checkout?paymentRef=${paymentRef}&pcct=${pcct}&amount=${amount}&isWeb=true`;
          },
          openWebApp: function() {
          window.location.href = "https://apps.apple.com/us/app/id1193357041";
        }
      };
  app.launchApp();
  }
 }
 
}