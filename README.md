# 🛍️ CJStore – Smart Multi-Vendor Commerce

CJStore is a modern, lightweight SAS commerce platform designed for small-scale entrepreneurs and multi-vendor marketplaces. It allows users to launch a fully functional online store in minutes with zero coding required.

## 🚀 Key Features

- **Instant Store Creation**: Unique URL slug for every store (e.g., `cjstore.com/store/your-shop`).
- **Multi-Vendor Support**: Isolated dashboards for different shop owners.
- **WhatsApp Ordering**: Direct "Chat with Store" integration that opens WhatsApp with a pre-formatted order message.
- **Product Management**: Full CRUD (Create, Read, Update, Delete) for products including stock tracking.
- **Real-time Analytics**: Simple tracking for store visits and product views.
- **Beautiful UI**: Modern, responsive design with Light/Dark mode support.

## 🏗️ Architecture Overview

The application is built using **Angular 19** with a heavy focus on high-performance reactive patterns:

- **Signal-based State**: Uses Angular Signals for efficient, real-time data updates.
- **LocalStorage Storage**: Current implementation uses Browser LocalStorage for demo purposes, ensuring a lag-free experience for local testing.
- **Modular Design**: Separated into `core` (services/guards) and `features` (auth, admin, public-store).

## 🛠️ Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://github.com/angular/angular-cli)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   ng serve
   ```
4. Open [http://localhost:4200/](http://localhost:4200/) in your browser.

## 📦 Data Storage Notice

> [!IMPORTANT]
> This application currently stores all data (**Stores, Products, Users**) in the browser's **LocalStorage**. 
> - **Syncing**: Data is not shared between different browsers or devices.
> - **Clearing**: If you clear your browser's site data/cache, the created stores and products will be reset to the default demo state.

## 🔮 Future Roadmap

- **Backend Integration**: Migrating to a persistent database (Spring Boot / Firebase).
- **Cloud Media**: Direct image uploads to Cloudinary or AWS S3.
- **Payment Gateway**: Integration with Stripe/Razorpay for direct online payments.
- **Advanced SEO**: Angular Universal (SSR) for better product indexing.

---
*Built with ❤️ for entrepreneurs.*
