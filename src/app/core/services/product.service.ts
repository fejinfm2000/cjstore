import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, map } from 'rxjs';

export interface Product {
    id: string;
    storeId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
    active: boolean;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/products`;

    private _products = signal<Product[]>([]);
    readonly products = this._products.asReadonly();

    getByStore(storeId: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/store/${storeId}`).pipe(
            tap(products => {
                // Update local signal with these specific products if needed
                // Note: In a multi-vendor app, global signal might be confusing
                // but we'll sync it for compatibility with existing components
                this._products.set(products);
            })
        );
    }

    createProduct(product: Partial<Product>, storeId: string): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product, { params: { storeId } }).pipe(
            tap(newProduct => {
                this._products.update(prev => [...prev, newProduct]);
            })
        );
    }

    updateProduct(id: string, product: Partial<Product>): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
            tap(updated => {
                this._products.update(prev => prev.map(p => p.id === id ? updated : p));
            })
        );
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this._products.update(prev => prev.filter(p => p.id !== id));
            })
        );
    }

    getCategories(storeId: string): Observable<string[]> {
        return this.getByStore(storeId).pipe(
            map(products => {
                const cats = products.filter(p => p.active).map(p => p.category);
                return [...new Set(cats)].sort();
            })
        );
    }

    search(storeId: string, query: string, category: string, sortBy: string): Observable<Product[]> {
        return this.getByStore(storeId).pipe(
            map(products => {
                let results = products.filter(p => p.active);
                if (query.trim()) {
                    const q = query.toLowerCase();
                    results = results.filter(p =>
                        p.name.toLowerCase().includes(q) ||
                        p.description.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q)
                    );
                }
                if (category && category !== 'All') {
                    results = results.filter(p => p.category === category);
                }
                if (sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
                else if (sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);
                else if (sortBy === 'name') results.sort((a, b) => a.name.localeCompare(b.name));
                return results;
            })
        );
    }
}
