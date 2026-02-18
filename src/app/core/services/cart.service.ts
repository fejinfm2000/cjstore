import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

// Future: enabled when onlineShopping feature flag is true
@Injectable({ providedIn: 'root' })
export class CartService {
    private _items = signal<CartItem[]>([]);
    readonly items = this._items.asReadonly();

    add(_product: Product): void {
        // TODO: implement when onlineShopping is enabled
        console.warn('CartService: onlineShopping feature is disabled.');
    }

    remove(_productId: string): void {
        // TODO: implement when onlineShopping is enabled
    }

    clear(): void {
        this._items.set([]);
    }

    getTotal(): number {
        return this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    }
}
