import { Injectable, signal } from '@angular/core';

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

const STORES_KEY = 'cjstore_stores';

@Injectable({ providedIn: 'root' })
export class StoreService {
    private _stores = signal<Store[]>(this.load());
    readonly stores = this._stores.asReadonly();

    private load(): Store[] {
        try {
            const raw = localStorage.getItem(STORES_KEY);
            const stores: Store[] = raw ? JSON.parse(raw) : [];
            // Seed demo store if empty
            if (stores.length === 0) {
                const demos = this.buildDemoStores();
                localStorage.setItem(STORES_KEY, JSON.stringify(demos));
                return demos;
            }
            // Ensure demo stores are added if missing (for existing users)
            const demoIds = ['demo-store-002', 'demo-store-003'];
            let hasChanges = false;
            let updatedStores = [...stores];

            const demos = this.buildDemoStores();
            demoIds.forEach((id, index) => {
                if (!stores.find(s => s.id === id)) {
                    updatedStores.push(demos[index + 1]); // demos[1] is Green, demos[2] is Tech
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                localStorage.setItem(STORES_KEY, JSON.stringify(updatedStores));
                return updatedStores;
            }
            return stores;
        } catch {
            return [];
        }
    }

    private buildDemoStores(): Store[] {
        return [
            {
                id: 'demo-store-001',
                name: 'Fashion Hub',
                slug: 'fashion-hub',
                ownerName: 'Demo Owner',
                email: 'demo@cjstore.com',
                whatsapp: '919876543210',
                logo: '',
                description: 'Your one-stop fashion destination. Trendy styles at great prices.',
                theme: 'light',
                createdAt: new Date().toISOString(),
                visits: 42
            },
            {
                id: 'demo-store-002',
                name: 'Green Groceries',
                slug: 'green-groceries',
                ownerName: 'Sara Green',
                email: 'sara@example.com',
                whatsapp: '918888888888',
                logo: '',
                description: 'Fresh organic vegetables and fruits delivered to your doorstep.',
                theme: 'light',
                createdAt: new Date().toISOString(),
                visits: 128
            },
            {
                id: 'demo-store-003',
                name: 'Tech Haven',
                slug: 'tech-haven',
                ownerName: 'Alex Rivera',
                email: 'alex@techhaven.com',
                whatsapp: '917777777777',
                logo: '',
                description: 'Latest gadgets, accessories, and computing gear for the modern pro.',
                theme: 'dark',
                createdAt: new Date().toISOString(),
                visits: 256
            }
        ];
    }

    private save(stores: Store[]): void {
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
        this._stores.set([...stores]);
    }

    getAll(): Store[] {
        return this._stores();
    }

    getBySlug(slug: string): Store | undefined {
        return this._stores().find(s => s.slug === slug);
    }

    getById(id: string): Store | undefined {
        return this._stores().find(s => s.id === id);
    }

    create(data: Omit<Store, 'id' | 'createdAt' | 'visits'>): Store {
        const store: Store = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            visits: 0
        };
        const stores = [...this._stores(), store];
        this.save(stores);
        return store;
    }

    update(id: string, data: Partial<Store>): Store | null {
        const stores = this._stores();
        const idx = stores.findIndex(s => s.id === id);
        if (idx === -1) return null;
        const updated = { ...stores[idx], ...data };
        const newStores = [...stores];
        newStores[idx] = updated;
        this.save(newStores);
        return updated;
    }

    incrementVisits(slug: string): void {
        const stores = this._stores();
        const idx = stores.findIndex(s => s.slug === slug);
        if (idx !== -1) {
            const newStores = [...stores];
            newStores[idx] = { ...newStores[idx], visits: newStores[idx].visits + 1 };
            this.save(newStores);
        }
    }

    slugExists(slug: string, excludeId?: string): boolean {
        return this._stores().some(s => s.slug === slug && s.id !== excludeId);
    }

    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }
}
