import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'store/:slug',
        loadComponent: () => import('./features/public-store/store-home/store-home.component').then(m => m.StoreHomeComponent)
    },
    {
        path: 'store/:slug/product/:id',
        loadComponent: () => import('./features/public-store/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    },
    {
        path: 'store/:slug/cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
    },
    {
        path: 'store/:slug/checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'add-product',
                loadComponent: () => import('./features/admin/add-product/add-product.component').then(m => m.AddProductComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/admin/manage-products/manage-products.component').then(m => m.ManageProductsComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/admin/store-settings/store-settings.component').then(m => m.StoreSettingsComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
