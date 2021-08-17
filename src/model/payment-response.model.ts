import { items } from "./payment-request.model";
export class PaymentResponseModel {
    amount: string  = "";
    paymentID: string="";
    paymentRef: string  = "";
    createTime: string="";
    message: string  = "";
    responseCode: string="";
    status: string  = "";
    items: Array<items>|undefined;
    
 }