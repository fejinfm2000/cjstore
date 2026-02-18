import { Injectable, signal } from '@angular/core';

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

const PRODUCTS_KEY = 'cjstore_products';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private _products = signal<Product[]>(this.load());
    readonly products = this._products.asReadonly();

    private load(): Product[] {
        try {
            const raw = localStorage.getItem(PRODUCTS_KEY);
            const products: Product[] = raw ? JSON.parse(raw) : [];
            if (products.length === 0) {
                const demo = this.buildDemoProducts();
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(demo));
                return demo;
            }
            // Ensure demo products for s2 and s3 are added if missing
            const checkIds = ['p101', 'p201'];
            let hasChanges = false;
            let updatedProducts = [...products];

            const demos = this.buildDemoProducts();
            if (!products.find(p => p.id === 'p101')) {
                const s2Products = demos.filter(p => p.storeId === 'demo-store-002');
                updatedProducts.push(...s2Products);
                hasChanges = true;
            }
            if (!products.find(p => p.id === 'p201')) {
                const s3Products = demos.filter(p => p.storeId === 'demo-store-003');
                updatedProducts.push(...s3Products);
                hasChanges = true;
            }

            if (hasChanges) {
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
                return updatedProducts;
            }
            return products;
        } catch {
            return [];
        }
    }

    private buildDemoProducts(): Product[] {
        const s1 = 'demo-store-001';
        const s2 = 'demo-store-002';
        return [
            // Store 1: Fashion Hub
            {
                id: 'p1', storeId: s1, name: 'Classic White Tee', description: 'Premium cotton classic white t-shirt, perfect for any occasion.', price: 599, category: 'T-Shirts', stock: 50, image: '', active: true, createdAt: new Date().toISOString()
            },
            {
                id: 'p2', storeId: s1, name: 'Slim Fit Jeans', description: 'Modern slim fit jeans in dark blue denim. Comfortable and stylish.', price: 1499, category: 'Jeans', stock: 30, image: '', active: true, createdAt: new Date().toISOString()
            },
            {
                id: 'p3', storeId: s1, name: 'Floral Summer Dress', description: 'Light and breezy floral dress perfect for summer outings.', price: 1299, category: 'Dresses', stock: 20, image: '', active: true, createdAt: new Date().toISOString()
            },
            // Store 2: Green Groceries
            {
                id: 'p101', storeId: s2, name: 'Organic Cherry Tomatoes', description: 'Sweet and juicy organic cherry tomatoes from local farms.', price: 120, category: 'Groceries', stock: 100, image: '', active: true, createdAt: new Date().toISOString()
            },
            {
                id: 'p102', storeId: s2, name: 'Fresh Hass Avocado', description: 'Perfectly ripe Hass avocados, sold individually.', price: 180, category: 'Groceries', stock: 40, image: '', active: true, createdAt: new Date().toISOString()
            },
            {
                id: 'p103', storeId: s2, name: 'Crunchy Fuji Apples', description: 'Sweet and crispy Fuji apples. Price per kg.', price: 250, category: 'Groceries', stock: 60, image: '', active: true, createdAt: new Date().toISOString()
            },
            // Store 3: Tech Haven
            {
                id: 'p201', storeId: 'demo-store-003', name: 'Wireless Earbuds', description: 'Noise cancelling wireless earbuds with 20h battery life.', price: 2999, category: 'Accessories', stock: 15, image: '', active: true, createdAt: new Date().toISOString()
            },
            {
                id: 'p202', storeId: 'demo-store-003', name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard with blue switches.', price: 1899, category: 'Computing', stock: 8, image: '', active: true, createdAt: new Date().toISOString()
            },
            // Others for Store 1
            {
                id: 'p4', storeId: s1, name: 'Leather Sneakers', description: 'Genuine leather sneakers with cushioned sole. Available in all sizes.', price: 2499, category: 'Footwear', stock: 15, image: '', active: true, createdAt: new Date().toISOString()
            },
            {
                id: 'p5', storeId: s1, name: 'Casual Hoodie', description: 'Warm and cozy hoodie for casual wear. Available in multiple colors.', price: 999, category: 'Hoodies', stock: 3, image: '', active: true, createdAt: new Date().toISOString()
            }
        ];
    }

    private save(products: Product[]): void {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        this._products.set([...products]);
    }

    getByStore(storeId: string): Product[] {
        return this._products().filter(p => p.storeId === storeId);
    }

    getActiveByStore(storeId: string): Product[] {
        return this._products().filter(p => p.storeId === storeId && p.active);
    }

    getById(id: string): Product | undefined {
        return this._products().find(p => p.id === id);
    }

    getCategories(storeId: string): string[] {
        const cats = this._products()
            .filter(p => p.storeId === storeId && p.active)
            .map(p => p.category);
        return [...new Set(cats)].sort();
    }

    create(data: Omit<Product, 'id' | 'createdAt'>): Product {
        const product: Product = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const products = [...this._products(), product];
        this.save(products);
        return product;
    }

    update(id: string, data: Partial<Product>): Product | null {
        const products = this._products();
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return null;
        const updated = { ...products[idx], ...data };
        const newProducts = [...products];
        newProducts[idx] = updated;
        this.save(newProducts);
        return updated;
    }

    delete(id: string): void {
        const products = this._products().filter(p => p.id !== id);
        this.save(products);
    }

    search(storeId: string, query: string, category: string, sortBy: string): Product[] {
        let results = this.getActiveByStore(storeId);
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
    }
}
