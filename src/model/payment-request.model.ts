
export class PaymentRequestModel {

   constructor(amount: number){
      this.amount = amount;
     this.noteToPayer = "";
     this.invoiceReference = 12345;
     this.serviceFee = 0;
     this.meta = new Meta();
     this.items = new Array<items>();
     this.items.push(new items(amount));

   }

    amount: number  = 0;
    noteToPayer: string="";
    invoiceReference: number  = 0;
    serviceFee: number=0;
    meta: Meta |undefined;
    items: Array<items>|undefined;
 }

 export class Meta {
    constructor(){
       this.referrer = "John";
       this.url="https://test.toptest.net/KSTP360x3/student360/onlinePayment";
       this.timeLoaded = 1624002325;
    }
    referrer: string  = "";
    url: string="";
    timeLoaded: number  = 0;
 }

 export class items {
    constructor(amount:number){
       this.productCode = "ChromeBook Repair/Chargers_04500_CCCD";
       this.accountCode = "ChromeBook Repair/Chargers_04500_CCCD";
       this.extendedPrice = amount;
       this.description = "1CRP - Computer Repair Fee - Lee, Marcus Arnold";
       this.payeeID = "darminius40@gmail.com";
       this.payeeName = "Lee, Pau";
       this.orderReferenceID = 35587;
    }
    productCode: string  = "";
    accountCode: string="";
    extendedPrice: number  = 0;
    description: string  = "";
    payeeID: string="";
    payeeName: string  = "";
    orderReferenceID: number=0;
    serviceFee: number  = 0;
 }