import { Injectable } from '@angular/core';

// Future: enabled when onlineShopping feature flag is true
@Injectable({ providedIn: 'root' })
export class PaymentService {
    initiatePayment(_orderId: string, _amount: number): Promise<void> {
        // TODO: integrate Razorpay / Stripe when onlineShopping is enabled
        return Promise.reject(new Error('PaymentService: onlineShopping feature is disabled.'));
    }

    verifyPayment(_paymentId: string): Promise<boolean> {
        // TODO: implement payment verification
        return Promise.resolve(false);
    }
}
