import { Injectable, signal, computed } from '@angular/core';

export interface User {
    id: string;
    ownerName: string;
    email: string;
    password: string;
    storeId: string;
}

const USERS_KEY = 'cjstore_users';
const SESSION_KEY = 'cjstore_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
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

    private getUsers(): User[] {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    register(data: Omit<User, 'id'>): { success: boolean; error?: string } {
        const users = this.getUsers();
        if (users.find(u => u.email === data.email)) {
            return { success: false, error: 'Email already registered.' };
        }
        const user: User = { ...data, id: crypto.randomUUID() };
        users.push(user);
        this.saveUsers(users);
        this.setSession(user);
        return { success: true };
    }

    login(email: string, password: string): { success: boolean; error?: string } {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return { success: false, error: 'Invalid email or password.' };
        }
        this.setSession(user);
        return { success: true };
    }

    logout(): void {
        localStorage.removeItem(SESSION_KEY);
        this._currentUser.set(null);
    }

    private setSession(user: User): void {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        this._currentUser.set(user);
    }

    updateSession(user: User): void {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = user;
            this.saveUsers(users);
        }
        this.setSession(user);
    }
}
