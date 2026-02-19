import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface PaymentOrder {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/payments`;

    createOrder(amount: number, storeId: string): Observable<PaymentOrder> {
        return this.http.post<PaymentOrder>(`${this.apiUrl}/create-order`, { amount, storeId });
    }

    verifyPayment(paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-payment`, paymentData);
    }
}
