import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of } from 'rxjs';

export interface User {
    id: string;
    ownerName: string;
    email: string;
    role: string;
    storeId?: string;
    slug?: string;
}

interface AuthResponse {
    token: string;
    id: string;
    email: string;
    ownerName: string;
    role: string;
    storeId?: string;
    slug?: string;
}

const SESSION_KEY = 'cjstore_session';
const TOKEN_KEY = 'cjstore_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    private _currentUser = signal<User | null>(this.loadSession());
    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);

    private loadSession(): User | null {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data);
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(res => {
                const user: User = {
                    id: res.id,
                    email: res.email,
                    ownerName: res.ownerName,
                    role: res.role,
                    storeId: res.storeId,
                    slug: res.slug
                };
                localStorage.setItem(TOKEN_KEY, res.token);
                this.setSession(user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        this._currentUser.set(null);
    }

    private setSession(user: User): void {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        this._currentUser.set(user);
    }

    updateSession(user: User): void {
        this.setSession(user);
    }
}
