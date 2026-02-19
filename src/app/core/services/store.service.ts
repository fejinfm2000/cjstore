import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface Store {
    id: string;
    name: string;
    slug: string;
    ownerName: string;
    email: string;
    whatsapp: string;
    logo: string;
    description: string;
    theme: 'light' | 'dark';
    createdAt: string;
    visits: number;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/stores`;

    private _stores = signal<Store[]>([]);
    readonly stores = this._stores.asReadonly();

    constructor() {
        this.loadStores();
    }

    private loadStores(): void {
        this.http.get<Store[]>(this.apiUrl).subscribe({
            next: (stores) => this._stores.set(stores),
            error: (err) => console.error('Failed to load stores', err)
        });
    }

    getBySlug(slug: string): Observable<Store> {
        return this.http.get<Store>(`${this.apiUrl}/${slug}`);
    }

    createStore(data: Partial<Store>, ownerId: string): Observable<Store> {
        return this.http.post<Store>(this.apiUrl, data, { params: { ownerId } }).pipe(
            tap(newStore => {
                this._stores.update(prev => [...prev, newStore]);
            })
        );
    }

    updateStore(id: string, data: Partial<Store>): Observable<Store> {
        return this.http.put<Store>(`${this.apiUrl}/${id}`, data).pipe(
            tap(updated => {
                this._stores.update(prev => prev.map(s => s.id === id ? updated : s));
            })
        );
    }

    getDashboardStats(storeId: string) {
        // This could be another API call in the future
        const store = this._stores().find(s => s.id === storeId);
        return {
            visits: store?.visits || 0,
            revenue: 0,
            orders: 0,
            avgOrderValue: 0
        };
    }
}
